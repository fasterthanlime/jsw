require 'rubygems'
require 'sinatra'
require 'stringio'
require 'net/sftp'
require 'net/http'

get '/sftp/put/*' do
  puts "host: #{params[:host]}, username: #{params[:username]}, password: #{params[:password]}"
  Net::SFTP.start(params[:host], params[:username], :password => params[:password]) do |sftp|
    begin
      io = StringIO.new(params[:content])
      sftp.upload!(io, params[:splat][0])
    rescue StatusException=>e
      sftp.mkdir! File.dirname(params[:splat][0])
      io = StringIO.new(params[:content])
      sftp.upload!(io, params[:splat][0])
    end
  end
  "#{params[:callback]}(#{"Success".dump})"
end

get '/get/*' do
  resp = ""
  puts "host = #{params[:host]}, url = #{params[:splat]}"
  Net::HTTP.start(params[:host]) { |http|
    get = http.get("/" + params[:splat][0])
    if get.code == '200'
      resp = params[:callback] + '("' + get.body.gsub('"', '\\"').gsub("\n", '\\n') + '")'
    end
  }
  resp
end

