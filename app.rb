require 'rubygems'
require 'sinatra'
require 'stringio'
require 'net/sftp'

get '/put/*' do
  #puts "host = #{params[:host]}, username = #{params[:username]}, password = #{params[:password]}"
  Net::SFTP.start(params[:host], params[:username], :password => params[:password]) do |sftp|
    io = StringIO.new(params[:content])
    sftp.upload!(io, params[:splat])
  end
  "Success!\n"
end

get '/get/*' do
  result = ""
  Net::SFTP.start(params[:host], params[:username], :password => params[:password]) do |sftp|
    io = StringIO.new
    sftp.download!(params[:splat], io)
    result = io.string
  end
  result
end

