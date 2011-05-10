## Description

### What's a wiki?

A wiki is a collaborative editing platform, allowing many to cooperate in writing a website.

However, the term has been extended to mean anything that can be edited from the web with minimal effort,
and making page creation extremely easy. That's exactly what jsw is.

### How do wikis usually work?

Usually, wikis allow users to edit the source files and then it's sent to the servers
so that they can generate HTML markup from the Wiki markup, and back to the browser for
preview.

Often, HTML pages are generated on-the-fly from source. Sometimes they are cached, so that
the computation doesn't need to occur everytime. But most importantly, it's usually the
**server** that does the markup translation. jsw is different.

### How is jsw different?

jsw is a **client-side wiki**, which means the HTML generation occurs in your browser,
while you type. Not only does this allow instant preview, it also means that your website
is now a simple collection of static HTML files, that you can drop on any web space.

In addition, all uploads are done on the background, it feels like a native text editor
thanks to HTML5 + JavaScript, and uses extended Markdown by default, which is a human-friendly
markup language.

### Isn't that less flexible than classic wiki solutions?

Well yes. Since the end result is just static pages, you can't do dynamic stuff like
printing the date or fancy database stuf. But who does wants that in a wiki anyway?

## Installing

### DISCLAIMER

AT THE TIME OF THIS WRITING, JSW'S SECURITY IS EQUIVALENT TO SWISS CHEESE GONE THROUGH
AN INDUSTRIAL MIXER. IF SOMEONE DECIDES TO SNIFF YOUR CONNECTION TO RETRIEVE YOUR FTP
IDENTIFIERS, YOU'RE ON YOUR OWN. I WILL ASSUME NO RESPONSIBILITIES FOR ANY DAMAGE CAUSED
BY YOUR USE OF JSW. I HOPE THAT'S CLEAR.

### Serving

For the frontend, just serve the project's directory with Apache or nginx, and configure
URL rewriting so that every subpath is served via index.htm

Here's a sample nginx configuration that works well for me:

    location /wiki/ {
      if (!-f $request_filename) {
        rewrite ^/wiki/(.*)$ /wiki/index.htm break;
      }
    }
    
A similar Apache configuration can be obtained via a .htaccess and mod_rewrite

For the backend, if you want to run it locally, just launch `ruby app.rb` - it
will listen on http://localhost:4567/ by default.

If you want to deploy it on Heroku (they have free hostings that are more than
enough for a jsw backend), run `heroku create [name]` in the backend folder,
then `git push heroku master`.

## Configuration

Don't forget to update jsw.js with your own paths. They're documented in the source,
so knock yourself out. 

## Usage

Pretty basic, eh.

So far, SFTP is the only backend, so the login box asks for your SFTP login and password.

Press enter in the password box to log in.

Ctrl+L focuses jsw's URL bar so you can quickly switch between pages (you can also use
the browser's URL bar but it's slower).

Press enter in the URL bar to go to a given page.

Ctrl+S saves the current page (or rather, queues it for upload).

The URL bar becomes red when there are unsaved changes.
