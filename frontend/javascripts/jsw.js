
var jsw = {    
  /* SFTP host you want to upload HTML files to */
  ftp_host: "ftp.jrcfoto.com",
  
  /* root path on the FTP server where to upload HTML files */
  ftp_directory: "public_html/subdomains/amoswenger.com/",
  
  /* access path for the administration interface (page editing) */
  admin_root: "http://localhost/jsw-frontend/",
  
  /* HTTP host where the actual site is running */
  http_host: "amoswenger.com",
  
  /* Address of the remote filesystem backend */
  backend: "http://localhost:4567/",
  
  /* Last version of the source we loaded from or sent to the server */
  saved_version: "",
  
  /* false if we have unsaved changes we might lose when  */
  clean: true,
  
  /* Compare last saved version with current, update 'unsaved' status and render */
  updateClean: function () {
    $source = $("#source");
    
    if($source.val() == jsw.saved_version) {
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
  
  /* Render the source for preview */
  render: function () {
    var source = $("#source").val();
    source = source.replace(/\$([A-Za-z_][A-Za-z0-9_\/]*)/g, "[$1](" + jsw.admin_root + "$1)");
    var html = window.markdown.toHTML(source);
    $("#preview").html(html);
  },
  
  /* Render the source for upload */
  final_render: function () {
    var source = $("#source").val();
    source = source.replace(/\$([A-Za-z_][A-Za-z0-9_\/]*)/g, "[$1]($1)");
    return window.markdown.toHTML(source);
  },
  
  /* Return current page path, based on current URL */
  page: function () {
    return document.location.href.slice(jsw.admin_root.length);
  },
  
  /* Go to a page, given its path. Changes the URL, loads the content from the backend */
  goto: function (page) {
    $("#url").val(page);
    $("#source").attr("disabled", true);
    document.title = page;
    window.history.pushState({
      "html": document.innerHTML,
      "pageTitle": page
    }, "", jsw.admin_root + page);
    
    $.ajax({
      type: "GET",
      dataType: "jsonp text",
      url: jsw.backend + "get/" + jsw.page() + ".md",
      data: {
        host: jsw.http_host
      },
      success: function (data) {
        $("#source").val(data);
      },
      error: function () {
        $("#source").val("");
      },
      complete: function () {
        jsw.saved_version = $("#source").val();
        $("#source").attr("disabled", false);
        jsw.updateClean();
        jsw.render();
      }
    });
  },
    
  /* Save the current page, sends modifications to the backend */
  save: function () {
    $("#url input").appendTo('<span id="status">saving...</span>');
    $("#source").attr("disabled", true);
    jsw.saved_version = $("#source").val();
    var done = 0;
    
    var finish = function () {
      $("#save").html('save').attr("disabled", false);
      $("#source").attr("disabled", false);
    }
    
    $.ajax({
      type: "GET",
      url: jsw.backend + "put/" + jsw.ftp_directory + jsw.page() + ".htm",
      dataType: "jsonp text",
      data: {
        host: jsw.ftp_host, username: $("#username").val(), password: $("#password").val(), content : $("#preview").html()
      },
      complete: function () {
        if (done == 1) {
          finish();
        } else {
          done++;
        }
      }
    });
    $.ajax({
      type: "GET",
      url: jsw.gateway + "put/" + jsw.ftp_directory + jsw.page() + ".md",
      dataType: "jsonp text",
      data: {
        host: jsw.ftp_host, username: $("#username").val(), password: $("#password").val(), content : $("#source").val()
      },
      complete: function () {
        if (done == 1) {
          finish();
        } else {
          done++;
        }
      }
    });
    jsw.clean = true;
    $("#url").removeClass("unsaved");
    $("#source").attr("disabled", false);
  }
};

$(function() {
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
  
  // 
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
          $.cookie("jsw_username", $("#username").val(), { path: '/', expires: 1 });
          $.cookie("jsw_password", $("#password").val(), { path: '/', expires: 1 });
          $("#coords").css("display", "none");
          $("#source").focus();
          return false;
      }
  });
  
  $("#source").keyup(function (ev) {
      jsw.updateClean();
  });
  
  function resizeWindow(e) {
    var newWindowHeight = $(window).height();
    $("#coords").css("margin-top", (newWindowHeight / 2 - 120) + "px");
  }
  resizeWindow();
  $(window).bind("resize", resizeWindow);
  
  if($.cookie("jsw_username") != null) {
    $("#username").val($.cookie("jsw_username"));
    $("#password").val($.cookie("jsw_password")).focus();
  } else {
    $("#username").focus();
  }
})
