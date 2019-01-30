package com.xiaoji.duan.aad;

import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.CompositeFuture;
import io.vertx.core.Future;
import io.vertx.core.http.HttpServerOptions;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.FindOptions;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.BodyHandler;
import io.vertx.ext.web.handler.StaticHandler;
import io.vertx.ext.web.handler.TemplateHandler;
import io.vertx.ext.web.templ.thymeleaf.ThymeleafTemplateEngine;

public class MainVerticle extends AbstractVerticle {

	private ThymeleafTemplateEngine thymeleaf = null;
	private MongoClient mongodb = null;

	@Override
	public void start(Future<Void> startFuture) throws Exception {
		JsonObject config = new JsonObject();
		config.put("host", config().getString("mongo.host", "duan-mongo"));
		config.put("port", config().getInteger("mongo.port", 27017));
		config.put("keepAlive", config().getBoolean("mongo.keepalive", true));
		mongodb = MongoClient.createShared(vertx, config);
		
		thymeleaf = ThymeleafTemplateEngine.create(vertx);
		TemplateHandler templatehandler = TemplateHandler.create(thymeleaf);

		ClassLoaderTemplateResolver resolver = new ClassLoaderTemplateResolver();
		resolver.setSuffix(".html");
		resolver.setCacheable(false);
		resolver.setTemplateMode("HTML5");
		resolver.setCharacterEncoding("utf-8");
		thymeleaf.getThymeleafTemplateEngine().setTemplateResolver(resolver);

		Router router = Router.router(vertx);

		StaticHandler staticfiles = StaticHandler.create().setCachingEnabled(false).setWebRoot("static");
		router.route("/aad/static/*").handler(staticfiles);
		router.route("/aad").pathRegex("\\/.+\\.json").handler(staticfiles);
		router.route("/aad").pathRegex("\\/.+\\.js").handler(staticfiles);
		router.route("/aad").pathRegex("\\/.+\\.css").handler(staticfiles);
		router.route("/aad").pathRegex("\\/.+\\.map").handler(staticfiles);

		BodyHandler datahandler = BodyHandler.create();
		router.route("/aad").pathRegex("\\/*").handler(datahandler);

		router.route("/aad/menus/*").handler(datahandler);
		router.route("/aad/menus/:subdomain/currentmenus").handler(ctx -> this.currentmenus(ctx));
		router.route("/aad/menus/:subdomain/list").handler(ctx -> this.list(ctx));
		router.route("/aad/menus/:subdomain/save").handler(ctx -> this.save(ctx));
		router.route("/aad/menus/:subdomain/:unionId/delete").handler(ctx -> this.delete(ctx));

		router.route("/aad/index").handler(ctx -> this.index(ctx));
		
		router.route("/aad").pathRegex("\\/[^\\.]*").handler(templatehandler);

		HttpServerOptions option = new HttpServerOptions();
		option.setCompressionSupported(true);

		vertx.createHttpServer(option).requestHandler(router::accept).listen(8080, http -> {
			if (http.succeeded()) {
				startFuture.complete();
				System.out.println("HTTP server started on http://localhost:8080");
			} else {
				startFuture.fail(http.cause());
			}
		});
	}

	private void currentmenus(RoutingContext ctx) {
		String subdomain = ctx.request().getParam("subdomain");
		JsonObject query = new JsonObject()
				.put("subdomain", subdomain)
				.put("menuParentId", 1)
				.put("$or", new JsonArray()
						.add(new JsonObject().put("isdel", false))
						.add(new JsonObject().put("isdel", new JsonObject().put("$exists", false)))
						);
		System.out.println(query.encode());
		Future<List<JsonObject>> up = Future.future();
		List<Future<JsonObject>> futuresList = new LinkedList<>();
		Future<JsonObject> rootfuture = Future.future();

		mongodb.findWithOptions("aad_menus", query, new FindOptions().setSort(
				new JsonObject().put("menuOrder", 1)),
						find -> {
			if (find.succeeded()) {
				List<JsonObject> rootMenus = find.result();
				
				if (rootMenus != null && rootMenus.size() > 0) {
					rootfuture.complete(new JsonObject()
							.put("menu", rootMenus));

					for (JsonObject rootmenu : rootMenus) {
						Future<JsonObject> future = Future.future();
						JsonObject subquery = new JsonObject()
								.put("subdomain", subdomain)
								.put("menuParentId", rootmenu.getInteger("menuId"))
								.put("$or", new JsonArray()
										.add(new JsonObject().put("isdel", false))
										.add(new JsonObject().put("isdel", new JsonObject().put("$exists", false))));
						System.out.println(subquery.encode());

						mongodb.findWithOptions("aad_menus", subquery, new FindOptions().setSort(
								new JsonObject().put("menuOrder", 1)),
								findsub -> {
							if (findsub.succeeded()) {
								future.complete(new JsonObject()
										.put("menu", rootmenu.getString("unionId"))
										.put("sub_menus", findsub.result()));
							} else {
								future.fail(findsub.cause());
							}
						});
						futuresList.add(future);
					}
					
					CompositeFuture.all(Arrays.asList(futuresList.toArray(new Future[futuresList.size()])))
					.map(v -> futuresList.stream().map(Future::result).collect(Collectors.toList()))
					.compose(compose -> {
						up.complete(compose);
					}, up).completer();
				} else {
					CompositeFuture.all(Arrays.asList(futuresList.toArray(new Future[futuresList.size()])))
					.map(v -> futuresList.stream().map(Future::result).collect(Collectors.toList()))
					.compose(compose -> {
						up.complete(compose);
					}, up).completer();
				
					rootfuture.complete(new JsonObject());
				}
			} else {
				CompositeFuture.all(Arrays.asList(futuresList.toArray(new Future[futuresList.size()])))
				.map(v -> futuresList.stream().map(Future::result).collect(Collectors.toList()))
				.compose(compose -> {
					up.complete(compose);
				}, up).completer();

				rootfuture.fail(find.cause());
			}
		});
		
		futuresList.add(rootfuture);
		
		up.setHandler(ar -> {
			if (ar.succeeded()) {
				List<JsonObject> results = ar.result();
				
				JsonArray response = new JsonArray();
				JsonArray root = new JsonArray();
				JsonObject dispatch = new JsonObject();
				
				for (JsonObject ele : results) {
					if (!ele.containsKey("sub_menus")) {
						root = (JsonArray) ele.getValue("menu");
					} else {
						dispatch.put(ele.getString("menu"), ele.getValue("sub_menus"));
					}
				}
				
				for (int i = 0; i < root.size(); i ++) {
					JsonObject rootmenu = root.getJsonObject(i);
					
					JsonArray submenus = dispatch.getJsonArray(rootmenu.getString("unionId"));
					
					response.add(rootmenu
							.put("menuLevel", 1)
							.put("subMenus", submenus.size()));
					
					for (int j = 0; j < submenus.size(); j++) {
						JsonObject submenu = submenus.getJsonObject(j);
						
						response.add(submenu
								.put("menuLevel", 2)
								.put("subMenus", 0));
					}
				}
				
				ctx.response().putHeader("content-type", "application/json;charset=utf-8").end(new JsonObject().put("data", response).encode());
			} else {
				ctx.response().end("[]");
			}
		});
	}
	
	private void save(RoutingContext ctx) {
		String subdomain = ctx.request().getParam("subdomain");
		JsonObject data = ctx.getBodyAsJson();
		System.out.println(data.encode());

    if (null == data.getString("unionId") || "".equals(data.getString("unionId"))) {
          data.put("unionId", UUID.randomUUID().toString());
          data.put("menuId", Integer.valueOf(data.getString("menuId")));
          data.put("menuParentId", Integer.valueOf(data.getString("menuParentId")));
          data.put("menuOrder", Integer.valueOf(data.getString("menuOrder")));
          
          mongodb.save("aad_menus", data, save -> {
            if (save.succeeded()) {
              ctx.response().end("{}");
            } else {
              ctx.response().end("{}");
            }
          });
    } else {
    
      mongodb.findOne("aad_menus", new JsonObject()
          .put("unionId", data.getString("unionId")), new JsonObject(), find -> {
        if (find.succeeded()) {
          JsonObject one = find.result();
          
          data.put("menuId", Integer.valueOf(data.getString("menuId")));
          data.put("menuParentId", Integer.valueOf(data.getString("menuParentId")));
          data.put("menuOrder", Integer.valueOf(data.getString("menuOrder")));

          JsonObject saveObject = null;
          if (one != null) {
            saveObject = one.mergeIn(data);
          } else {
            saveObject = data;
          }
          
          mongodb.save("aad_menus", saveObject, save -> {
            if (save.succeeded()) {
              ctx.response().end("{}");
            } else {
              ctx.response().end("{}");
            }
          });
        } else {
          ctx.response().end("{}");
        }
      });
    }
	}
	
	private void list(RoutingContext ctx) {
		String subdomain = ctx.request().getParam("subdomain");
		JsonObject query = new JsonObject()
				.put("subdomain", subdomain)
				.put("$or", new JsonArray()
						.add(new JsonObject().put("isdel", false))
						.add(new JsonObject().put("isdel", new JsonObject().put("$exists", false))));
		System.out.println(query.encode());
		
		mongodb.find("aad_menus", query, find -> {
			if (find.succeeded()) {
				List<JsonObject> menus = find.result();
				
				ctx.response().end(new JsonObject().put("data", menus).encode());
			} else {
				ctx.response().end("{}");
			}
		});
	}
	
	private void delete(RoutingContext ctx) {
		String subdomain = ctx.request().getParam("subdomain");
		String unionId = ctx.request().getParam("unionId");
		System.out.println(subdomain + "/" + unionId + " delete");

		mongodb.findOne("aad_menus", new JsonObject().put("unionId", unionId), new JsonObject(), find -> {
			if (find.succeeded()) {
				JsonObject one = find.result();
				
				if (one != null) {
					one.put("isdel", true);
					mongodb.save("aad_menus", one, save -> {
						if (save.succeeded()) {
							ctx.response().end("{}");
						} else {
							ctx.response().end("{}");
						}
					});
				} else {
					ctx.response().end("{}");
				}
				
			} else {
				ctx.response().end("{}");
			}
		});
	}

	private void index(RoutingContext ctx) {
		ctx.next();
	}

}
