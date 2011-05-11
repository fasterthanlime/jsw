require 'rubygems'
require 'sinatra'
require 'stringio'
require 'net/sftp'

get '/sftp/put/*' do
  puts "host: #{params[:host]}, username: #{params[:username]}, password: #{params[:password]}"
  Net::SFTP.start(params[:host], params[:username], :password => params[:password]) do |sftp|
    begin
      io = StringIO.new(params[:content])
      sftp.upload!(io, params[:splat][0])
    rescue Exception=>e
      sftp.mkdir! File.dirname(params[:splat][0])
      io = StringIO.new(params[:content])
      sftp.upload!(io, params[:splat][0])
    end
  end
  "#{params[:callback]}(#{"Success".dump})"
end
