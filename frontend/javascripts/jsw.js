var jsw = {    
  /* SFTP host you want to upload HTML files to */
  ftp_host: "ftp.jrcfoto.com",
  
  /* root path on the FTP server where to upload HTML files */
  ftp_directory: "public_html/subdomains/amoswenger.com/",
  
  /* access path for the administration interface (page editing) */
  admin_root: "http://amoswenger.com/admin/",
  
  /* HTTP host where the actual site is running */
  http_host: "http://amoswenger.com/",
  
  /* Address of the remote filesystem backend */
  backend: "http://jsw-backend.heroku.com/",
  
  /* Last version of the source we loaded from or sent to the server */
  saved_version: "",
  
  /* false if we have unsaved changes we might lose when  */
  clean: true,
  
  /* TODO: make it modular */
  header: '<!DOCTYPE html><html><head><link rel="stylesheet" href="/stylesheets/main.css"></head><body><div id="content">',
  footer: '</div><div id="footer">powered by <a href="https://github.com/nddrylliog/jsw">jsw</a></div></body></html>',
  
  /* Compare last saved version with current, update 'unsaved' status and render */
  updateClean: function () {
    if(jsw.getSource() == jsw.saved_version) {
      if(!jsw.clean) {
        jsw.clean = true;
        $("#url").removeClass("unsaved");
      }
    } else {
      if(jsw.clean) {
        jsw.clean = false;
        $("#url").addClass("unsaved");
      }
      jsw.render();
    }
  },
  
  /* Store username/passwords in cookies. Yes, that's way insecure. You were warned. */
  login: function () {
    $.cookie("jsw_username", $("#username").val(), { path: '/', expires: 1 });
    $.cookie("jsw_password", $("#password").val(), { path: '/', expires: 1 });
    $("#coords").css("display", "none");
    $("#source").focus();
  },
  
  /* Render the source for preview */
  render: function () {
    var source = jsw.getSource();
    source = source.replace(/\$([A-Za-z_][A-Za-z0-9_\/]*)/g, "[$1](" + jsw.admin_root + "$1)");
    var html = jsw.converter.makeHtml(source);
    $("#preview").html(html);
    $('#preview a[href^="' + jsw.admin_root + '"]').css('color', 'red').click(function (e) {
      if(e.button == 0 && !e.ctrlKey) {
        // on left button clicks, load in-app. still allow middle clicks to open new tabs
        jsw.goto($(this).attr("href").slice(jsw.admin_root.length));
        return false;
      }
    });
  },
  
  /* Render the source for upload */
  final_render: function () {
    var source = jsw.getSource();
    source = source.replace(/\$([A-Za-z_][A-Za-z0-9_\/]*)/g, "[$1]($1)");
    return jsw.header + jsw.converter.makeHtml(source) + jsw.footer;
  },
  
  /* Return current page path, based on current URL */
  page: function () {
    return document.location.href.slice(jsw.admin_root.length);
  },
  
  /* Go to a page, given its path. Changes the URL, loads the content from the backend */
  goto: function (page) {
    $("#url").val(page);
    $("#source").attr("disabled", true);
    
    if(jsw.page() != page) {
      document.title = page;
      window.history.pushState({
        "html": document.innerHTML,
        "pageTitle": page
      }, "", jsw.admin_root + page);
    }
    
    var page_path = jsw.page()
    if(page_path.indexOf('.') == -1) {
      page_path += '.md';
    }
    
    $.ajax({
      type: "GET",
      dataType: "text",
      url: jsw.http_host + "/" + page_path,
      success: function (data) { jsw.setSource(data); },
      error  : function ()     { jsw.setSource("");   },
      complete: function () {
        jsw.saved_version = jsw.getSource();
        $("#source").attr("disabled", false);
        jsw.updateClean();
        jsw.render();
      }
    });
  },
    
  /* Save the current page, sends modifications to the backend */
  save: function () {
    $("#source").attr("disabled", true).addClass('loading');
    jsw.saved_version = jsw.getSource();
    var done = 0;
    
    var finish = function () {
      $("#save").html('save').attr("disabled", false);
      $("#source").removeClass('loading');
    }
    
    var page_path = jsw.page()
    if(page_path.indexOf('.') == -1) {
      $.ajax({
        type: "GET",
        url: jsw.backend + "sftp/put/" + jsw.ftp_directory + jsw.page() + ".htm",
        dataType: "jsonp text",
        data: {
          host: jsw.ftp_host, username: $("#username").val(), password: $("#password").val(), content : jsw.final_render()
        },
        complete: function () {
          if (done == 1) { finish(); } else { done++; }
        }
      });
      
      $.ajax({
        type: "GET",
        url: jsw.backend + "sftp/put/" + jsw.ftp_directory + jsw.page() + ".md",
        dataType: "jsonp text",
        data: {
          host: jsw.ftp_host, username: $("#username").val(), password: $("#password").val(), content : jsw.getSource()
        },
        complete: function () {
          if (done == 1) { finish(); } else { done++; }
        }
      });
    } else {
      $.ajax({
        type: "GET",
        url: jsw.backend + "sftp/put/" + jsw.ftp_directory + jsw.page(),
        dataType: "jsonp text",
        data: {
          host: jsw.ftp_host, username: $("#username").val(), password: $("#password").val(), content : jsw.getSource()
        },
        complete: function () { finish(); }
      });
    }
    
    jsw.clean = true;
    $("#url").removeClass("unsaved");
    $("#source").attr("disabled", false);
  }
};

$(function() {
    // markdown
    jsw.converter = new Showdown.converter();
  
    // ace editor integration
    jsw.editor = ace.edit('source');
    jsw.session = jsw.editor.getSession();
    jsw.session.setUseWrapMode(true);
    jsw.session.on('change', jsw.updateClean);
        
    jsw.setSource = function (value) {
      jsw.session.setValue(value);
    }
    
    jsw.getSource = function () {
      return jsw.session.getValue();
    }
    
    window.onpopstate = function (event) {
      jsw.goto(jsw.page());
    };
    
    // login window hacks
    function resizeWindow(e) {
      var newWindowHeight = $(window).height();
      $("#coords").css("margin-top", (newWindowHeight / 2 - 120) + "px");
    }
    resizeWindow();
    $(window).bind("resize", resizeWindow);
    
    // ctrl shortcuts hack
    $.ctrl = function(key, callback, args) {
        $(document).keydown(function(e) {
            if(!args) args=[]; // IE barks when args is null
            if(e.keyCode == key.charCodeAt(0) && e.ctrlKey) {
                callback.apply(this, args);
                return false;
            }
        });
    };
    
    if(jsw.page().length == 0) {
        jsw.goto("index");
    } else {
        jsw.goto(jsw.page());
    }
    
    // Ctrl+S = save
    $.ctrl('S', jsw.save);
    
    // Ctrl+L = focus URL bar
    $.ctrl('L', function() { $("#url").focus().select(); });
    
    // navigation
    $("#url").keydown(function (ev) {
        if (ev.which == 13) {
          jsw.goto($("#url").val());
        }
    });
    
    $("#username").keydown(function (ev) {
      if (ev.which == 13) {
        $("#password").focus();
      }
    });
    
    $("#password").keydown(function (ev) {
      if (ev.which == 13) {
        jsw.login();
        return false;
      }
    });
    
    // logout
    $("#logout").click(function () {
      $("#coords").css("display", "block")
      $("#password").val("");
      $("#username").val("").focus();
      return false;
    });
    
    if($.cookie("jsw_username") != null) {
      // auto-login
      $("#username").val($.cookie("jsw_username"));
      $("#password").val($.cookie("jsw_password"));
      jsw.login();
    } else {
      // saves time!
      $("#username").focus();
    }
});
