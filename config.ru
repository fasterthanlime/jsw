require 'sinatra'
require ::File.join(::File.dirname(__FILE__), %w[app.rb])

run Sinatra::Application
