#!/usr/bin/env ruby

require 'rubygems'
gem 'johnson', '>= 2.0.0.pre3'
require 'johnson/runtime'
require 'envjs/runtime'
require 'test/unit'

class JSDeferredTest < Test::Unit::TestCase
  module Utils
    def color(str, color = 31, newline = true)
      if STDOUT.tty?
        print "\033[1;#{color}m%s\033[0m#{newline ? "\n" : ''}" % str
      else
        print "%s#{newline ? "\n" : ''}" % str
      end
    end

    def js_init
      <<-JS
Global = (function () { return this })();
Deferred.next = Deferred.next_default;
function expect (msg, expect, result) {
  if (expect == result) {
    ok(msg, uneval(expect), uneval(result));
  } else {
    ng(msg, uneval(expect), uneval(result));
  }
  return true;
}
      JS
    end

    def jquery_cache
      @jquery_cachename ||= '.cache.jquery-1.2.6.min.js'
      if File.exist? @jquery_cachename
        open(@jquery_cachename).read
      else
        require 'open-uri'
        source = open('http://jqueryjs.googlecode.com/files/jquery-1.2.6.min.js').read
        open(@jquery_cachename, 'w') {|f| 
          f.puts source
        }
        source
      end
    end
  end
  include Utils

  def test_main
    runtime = Johnson::Runtime.new
    runtime.extend Envjs::Runtime
    runtime.evaluate jquery_cache
    runtime.evaluate open('jsdeferred.js').read
    runtime.evaluate open('binding/jquery.js').read

    runtime.evaluate js_init

    filename = 'test-jsdeferred.js'
    full_source = open(filename).read
    regexp = /\/\/ ::Test::Start::([\s\S]+)::Test::End::/
    startline = full_source.split(regexp).first.lines.to_a.length + 1
    source = full_source.match(regexp)[1]

    testfuns = source.scan(/(ok|expect)\(.+/)
    total = testfuns.size
    runtime['testfuns'] = proc { testfuns }

    assert_count = 0
    runtime['ok'] = proc {|*msg| assert_count+=1; color("[#{assert_count}/#{total}] ", 34, false); assert true, color(msg.join(', '), 32) }
    runtime['ng'] = proc {|*msg| assert false, color(msg.join(', '), 31)}
    runtime['skip'] = proc {|*msg| assert true, msg }
    runtime['log'] = runtime['print'] = runtime['msg'] = proc {|*args| puts args }

    runtime.evaluate source, filename, startline
    runtime.wait
    assert_equal assert_count , total, "All Tests running!"
  end
end

