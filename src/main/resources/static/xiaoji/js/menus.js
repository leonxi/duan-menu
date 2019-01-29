/**
 * Created by xilj on 2017/9/18.
 */
/**
 *  需要添加导入jquery使用
 *  <script src="https://code.jquery.com/jquery-3.2.1.min.js"></script>
 */

var subdomain = window.location.host.split('.', 1)[0];
$(function () {
	$("<link>").attr({
		rel: "stylesheet",
		type: "text/css",
		href: "/fontawesome/css/all.min.css"
	}).appendTo("head");
	
	// AngularJS等单页面网页
	var isSPA = false;
	
	if ($("app-root").length > 0) {
	  isSPA = true;
	  
	  $("<link>").attr({
	    rel: "stylesheet",
	    type: "text/css",
	    href: "/bootstrap/css/bootstrap.min.css"
	  }).appendTo("head");
    $("<link>").attr({
      rel: "stylesheet",
      type: "text/css",
      href: "/css/docs.min.css"
    }).appendTo("head");
    $.getScript("/bootstrap/js/bootstrap.min.js");
    $.getScript("/jquery/js/popper.min.js");
	}
	
	// 工时统计异种结构
	var isSpecial = false;
	if ($("body div.xiaoji").length > 0) {
	  isSpecial = true;
	  
    $("<link>").attr({
      rel: "stylesheet",
      type: "text/css",
      href: "/css/docs.min.css"
    }).appendTo("head");
	}

	$("head").append("<style type=\"text/css\">" +
    "a.nav-link:hover {" +
    "    cursor: pointer;" +
    "}" +
    "" +
		"i#usernamechange:hover {" +
		"    cursor: pointer;" +
		"}" +
		"" +
		"span#profile:hover {" +
		"    cursor: pointer;" +
		"}" +
		"" +
		"i#logout:hover {" +
		"    cursor: pointer;" +
		"}" +
		"" +
		".dropdown-submenu {" +
		"    position:relative;" +
		"}" +
		"" +
		".dropdown-submenu > .dropdown-menu{" +
		"    top:0;" +
		"    left:100%;" +
		"    margin-top:-6px;" +
		"    margin-left:-1px;" +
		"    -webkit-border-radius:0 6px 6px 6px;" +
		"    -moz-border-radius:0 6px 6px 6px;" +
		"    border-radius:0 6px 6px 6px;" +
		"}" +
		"" +
		".dropdown-submenu:hover > .dropdown-menu{" +
		"    display:block;" +
		"}" +
		"" +
		".dropdown-submenu > a:after{" +
		"    display:block;" +
		"    content:\" \";" +
		"    float:right;" +
		"    width:0;" +
		"    height:0;" +
		"    border-color:transparent;" +
		"    border-style:solid;" +
		"    border-width:5px 0 5px 5px;" +
		"    border-left-color:#cccccc;" +
		"    margin-top:5px;" +
		"    margin-right:-10px;" +
		"}" +
		"" + 
		".dropdown-submenu:hover > a:after{" +
		"    border-left-color:#ffffff;" +
		"}" +
		"" + 
		".dropdown-submenu .pull-left{" +
		"    float:none;" +
		"}" +
		"" + 
		".dropdown-submenu.pull-left > .dropdown-menu{" +
		"    left:-100%;" +
		"    margin-left:10px;" +
		"    -webkit-border-radius:6px 0 6px 6px;" +
		"    -moz-border-radius:6px 0 6px 6px;" +
		"    border-radius:6px 0 6px 6px;" +
	"}");
	var form = $("body > header > form").clone();
	
	if (isSPA) {
	  var headercustom = $("span.header_time").clone();
	}
	
	if (isSpecial) {
	  var headerspecial = $("div.xiaoji").clone();
	}
	
	var loadheadermenu = function() {
		$("body > header").remove();
	    $("body").prepend($("<header class='navbar navbar-expand navbar-dark flex-column flex-md-row bd-navbar'>" +
	    		" <a class='navbar-brand' href='/'>短应用&trade;</a>" +
	    		"  <div class=\"collapse navbar-collapse\">" +
	    		"  <ul id='navbars' class='navbar-nav bd-navbar-nav flex-row'></ul>" +
	    		" </div>" +
	    		" <ul id='navbars2' class=\"navbar-nav flex-row ml-md-auto d-none d-md-flex\">" +
	    		" </ul>" +
	    		" <span class=\"navbar-text\">" +
	    		" </span>" +
	    		"</header>"));
	    if (form.length > 0) {
	    	$("body > header > span.navbar-text").before(form);
	    }
	    
	    if (isSPA && headercustom.length > 0) {
	      var replacecustom = $("<li class=\"nav-item\">" +
	          "<a class=\"nav-item nav-link prevmonth\">&lt;</a>" +
	          "</li>" +
	          "<li class=\"nav-item\">" +
            "<a class=\"nav-item nav-link yearmonth\"></a>" +
            "</li>" +
	          "<li class=\"nav-item\">" +
            "<a class=\"nav-item nav-link nextmonth\">&gt;</a>" +
            "</li>" +
            "<li class=\"nav-item\">" +
            "<a class=\"nav-item nav-link mr-md-2 today\">今天</a>" +
            "</li>");
        $("body > header > ul#navbars2").append(replacecustom);
        var setYearMonth = function() {
          $("body > header a.yearmonth").text($("body > app-root span.header_dt_num").text());
          $("body > app-root nz-header").css("display", "none");
          $("body > app-root nz-content").css("margin-top", "0");
          $("body > app-root nz-sider").css("margin-top", "0");
        };
        $("body > app-root span.header_month").bind("DOMCharacterDataModified", function() {
          setYearMonth();
        });
        replacecustom.find("a.prevmonth").on("click", function() {
          $("body > app-root span.header_prev_month").trigger("click");
          setYearMonth();
        });
        replacecustom.find("a.nextmonth").on("click", function() {
          $("body > app-root span.header_next_month").trigger("click");
          setYearMonth();
        });
        replacecustom.find("a.today").on("click", function() {
          $("body > app-root span.header_today").trigger("click");
          setYearMonth();
        });
        setYearMonth();
	    }
	    
	    if (isSpecial && headerspecial.length > 0) {
        var replacecustom = $("<li class=\"nav-item\">" +
            "<a class=\"nav-item nav-link prevmonth\">&lt;</a>" +
            "</li>" +
            "<li class=\"nav-item\">" +
            "<a class=\"nav-item nav-link yearmonth\"></a>" +
            "</li>" +
            "<li class=\"nav-item\">" +
            "<a class=\"nav-item nav-link nextmonth\">&gt;</a>" +
            "</li>" +
            "<li class=\"nav-item\">" +
            "<a class=\"nav-item nav-link mr-md-2 today\">今天</a>" +
            "</li>");
        $("body > header > ul#navbars2").append(replacecustom);
        var setYearMonth = function() {
          $("body > header a.yearmonth").text($("body div.xiaoji > span:last > div").text());
          $("body div.xiaoji").css("display", "none");
        };
        $("body div.xiaoji > span:last > div > span").bind("DOMCharacterDataModified DOMNodeInserted", function() {
          setYearMonth();
        });
        replacecustom.find("a.prevmonth").on("click", function() {
          $("body div.xiaoji span#prev-month").trigger("click");
          setYearMonth();
        });
        replacecustom.find("a.nextmonth").on("click", function() {
          $("body div.xiaoji span#next-month").trigger("click");
          setYearMonth();
        });
        replacecustom.find("a.today").on("click", function() {
          $("body div.xiaoji span#today").trigger("click");
          setYearMonth();
        });
        setYearMonth();
	    }
	    
	    var processuser = function(username) {
	    if (username != undefined && username != '') {
	        $("header > span:last-child").html("<span id=\"profile\"><i class=\"fa fa-male\"></i> " + username + "</span> <i id=\"logout\" class=\"fas fa-sign-out-alt\"></i>");
	        $("#profile").popover({
	        	title: '用户属性',
	        	html: true,
	        	placement: 'bottom',
	        	trigger: 'click',
	        	content: '<form class="form-inline my-2 my-lg-0">  <div class="form-group"><div class="input-group"><input type="text" class="form-control form-control-sm popover-custom" id="profile_username" name="profile_username" style="border-right:0px;" value="' + username + '"><div class="input-group-append popover-custom"><span class="input-group-text" style="background-color:transparent;border-left:0px;"><i id="usernamechange" class="fa fa-check"></i></span></div></div></div></form>',
	        	template: '<div class="popover" style="z-index:9999;" role="tooltip"><div class="arrow"></div><h3 class="popover-header"></h3><div class="popover-body"></div></div>'
	        });
	        $("#profile").on("shown.bs.popover", function() {
	        	$("#usernamechange").bind("click", function() {
	        		var profile_username = $("input#profile_username").val();
	        		if (profile_username !== undefined && profile_username !== '') {
	    	          $.ajax({
	    	        	url: "http://" + subdomain + ".guobaa.com/abd/my/" + subdomain + "/updateusername",
	    	            type: "post",
	    	            data: {'username': profile_username},
	    	            dataType: "json",
	    	            success: function(resp) {
	    	            	console.log(resp);
	    	            	$("#profile").popover('hide');
	    	            	$("input#username").val(profile_username);
	    	            	loadheadermenu();
	    	            	
	    	            	if (isSpecial) {
	    	            	  var enter = $.Event("keypress");
	    	            	  enter.keyCode = 13;
	    	            	  $("div.xiaoji input#username").trigger(enter);
	    	            	}
	    	            },
	    	            error: function(resp) {
	    	            	console.log(resp);
	    	            }
	    	          });
	        		}
	        	});
	        	$('body').bind("click", function (event) {
	        		var target = $(event.target);
	        		if (!target.hasClass('popover')
        				&& !target.hasClass('pop')
	                    && !target.hasClass('popover-content')
                      && !target.hasClass('popover-title')
                      && !target.hasClass('popover-header')
                      && !target.hasClass('popover-custom')
                      && !target.hasClass('popover-body')
	                    && !target.hasClass('arrow')) {
	        			$('#profile').popover('hide'); 
	        		}
	        	});
	        });
	        $("#profile").on("hidden.bs.popover	", function() {
	        	$("#usernamechange").unbind("click");
	        	$('body').unbind("click");
	        });
	        $("#logout").on("click", function() {
	        	window.location.href = "/aba/logout";
	        });
	    }
	  }

	  var username = $("input#username").val();
    if (username != undefined && username != '') {
      processuser(username);
    } else {
      $.ajax({
        url: "/abd/my/" + subdomain + "/username",
        type: "post",
        data: "",
        dataType: "json",
        success: function(result) {
          if (result.data != undefined && !$.isEmptyObject(result.data)) {
            if ($("input#username").length > 0) {
              processuser(result.data.name);
            } else {
              $("body").prepend("<input type=\"hidden\" id=\"username\" name=\"username\" value=\"" + result.data.name + "\">");
              processuser(result.data.name);
            }
          }
        }
      });
    }
    
		$.ajax({url:"/aad/menus/" + subdomain + "/currentmenus",success:function(result){
	        console.log(result)
			var list = result.data;
	        
	        var preparentmenuid = 1;
	        var premenuid = 0;
	        var premenulevel = 0;
	        
	        var menucontent = "";
	        
	        for (var i=0;i<list.length;i++)
	        {
	            var listitem = list[i];
	            var parentmenuid = listitem.menuParentId;
	            var menuid = listitem.menuId;
	            var menulevel = listitem.menuLevel;
	            var isPopup = (listitem.menuPopupId === undefined ? false : (listitem.menuPopupId === '' ? false : true));
	            var menuPopupId = listitem.menuPopupId;
	            
	            if (premenulevel > menulevel) {
	                var maxlevel = premenulevel - 1;
	                for (var j=menulevel;j<=maxlevel;j++) {
	                    menucontent += "</div></li>";
	                }
	            }
	            if (listitem.subMenus > 0) {
	                if (menulevel == 1) {
	                    menucontent += "<li class='nav-item dropdown'><a id='MENU_";
	                    menucontent += listitem.menuId;
	                    menucontent += "' href='#' class='nav-item nav-link dropdown-toggle mr-md-2' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>";
	                    menucontent += listitem.menuName;
	                    menucontent += " </a>";
	                } else {
	                    menucontent += "<li class='nav-item dropdown-submenu'><a id='MENU_";
	                    menucontent += listitem.menuId;
	                    menucontent += "' href='#' class='dropdown-toggle' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>";
	                    menucontent += listitem.menuName;
	                    menucontent += "</a>";
	                }
	                menucontent += "<div class='dropdown-menu dropdown-menu-left' aria-labelledby='MENU_";
	                menucontent += listitem.menuId;
	                menucontent += "'>";
	            } else {
	            	if (menulevel == 1) {
	                    menucontent += "<li class='nav-item'><a href='";
	                    menucontent += listitem.menuAction;
                      menucontent += "' ";
                      if (isPopup) {
                        menucontent += "target='";
                        menucontent += menuPopupId;
                        menucontent += "' ";
                      }
	                    menucontent += "class='nav-link'>";
	                    menucontent += listitem.menuName;
	                    menucontent += "</a></li>";
	            	} else {
	                    menucontent += "<a href='";
	                    menucontent += listitem.menuAction;
                      menucontent += "' ";
                      if (isPopup) {
                        menucontent += "target='";
                        menucontent += menuPopupId;
                        menucontent += "' ";
                      }
	                    menucontent += "' class='dropdown-item'>";
	                    menucontent += listitem.menuName;
	                    menucontent += "</a>";
	            	}
	            }
	            
	            preparentmenuid = listitem.menuParentId;
	            premenuid = listitem.menuId;
	            premenulevel = listitem.menuLevel;
	        }
	        
	        if (premenulevel > 1) {
	            var maxlevel = premenulevel - 1;

	            for (var j=1;j<=maxlevel;j++) {
	                menucontent += "</ul></li>";
	            }
	        }
	        
	        $("#navbars").append(menucontent);
	    }});
	};
	
	loadheadermenu();

	$("body > footer").remove();
    $("body").append($("<footer class=\"bd-footer text-muted\">" +
	  "<div class=\"container-fluid p-3 p-md-5\">" +
	  "  <ul class=\"bd-footer-links\">" +
	  "  </ul>" +
	  "  <p>短应用&trade;由效吉软件&trade;设计和构筑。由短应用团队运营维护。</p>" +
	  "  <p>版权所有&copy;上海效吉软件有限公司 - 沪ICP备14038906号-1</p>" +
	  "</div>" +
	"</footer>"));
    
});
