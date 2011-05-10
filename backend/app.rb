require 'rubygems'
require 'sinatra'
require 'stringio'
require 'net/sftp'
require 'net/http'

get '/sftp/put/*' do
  puts "host: #{params[:host]}, username: #{params[:username]}, password: #{params[:password]}"
  Net::SFTP.start(params[:host], params[:username], :password => params[:password]) do |sftp|
    io = StringIO.new(params[:content])
    sftp.upload!(io, params[:splat])
  end
  "#{params[:callback]}(#{"Success".dump})"
end

get '/get/*' do
  resp = ""
  puts "host = #{params[:host]}, url = #{params[:splat]}"
  Net::HTTP.start(params[:host]) { |http|
    get = http.get("/" + params[:splat][0])
    if get.code == '200'
      resp = params[:callback] + "(" + get.body.gsub("\"", "\\\"").dump + ")"
    end
  }
  resp
end

