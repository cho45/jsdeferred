
require "rubygems"
require "rake"
require "rake/clean"

COPYRIGHT = <<EOS
JSDefeered (c) Copyright (c) 2007 cho45 ( www.lowreal.net )
See http://coderepos.org/share/wiki/JSDeferred
EOS

CLEAN.include ["jsdeferred.{nodoc,mini,jquery,userscript}.js"]
RELEASES = %w(
	jsdeferred.js
	jsdeferred.nodoc.js
	jsdeferred.mini.js
	jsdeferred.jquery.js
	jsdeferred.userscript.js
	doc/index.html
)
Version = File.read("jsdeferred.js")[/Version:: (\d+\.\d+\.\d+)/, 1]

def mini(js, commentonly=false)
	js = js.dup
	js.gsub!(%r|\n?/\*.*?\*/|m, "")
	js.gsub!(%r|\n?\s*//.*|, "")
	js.gsub!(/\A\s+|\s+\z/, "")
	unless commentonly
		js.gsub!(/^\s+/, "")
		js.gsub!(/[ \t]+/, " ")
		js.gsub!(/\n\n+/, "\n")
		js.gsub!(/\s?;\s?/, ";")
		js.gsub!(/ ?([{}()<>:=,*\/+-]) ?/, "\\1")
	end
	COPYRIGHT.gsub(/^/, "// ") + js
end

task :default => [:test]

desc "Test JSDeferred"
task :test => RELEASES do
	sh %{rhino -opt 0 -w -strict test-rhino.js jsdeferred.js}
end

desc "Make all release file and tagging #{Version}"
task :release => [:update, :clean, :test] do
	# Additional Tests
#	[".nodoc", ".mini"].each do |f|
#		sleep 3
#		sh %{rhino test-rhino.js jsdeferred#{f}.js}
#	end
	ENV["LANG"] = "C"
	info = `svn info`
#	day = Time.now.strftime("%Y-%m-%d")
#	rev = info[/Revision: (\d+)/, 1].to_i
#	ver = "#{day}.r#{rev}"

	ver = Version
	puts "Releasing:: #{ver}"

	st = `svn st`
	unless st.empty?
		puts "Any changes remain?"
		puts st
		exit
	end

	require "uri"
	url = URI(info[/URL: ([^\s]+)/, 1]) + "."
	puts url
	com = %{svn cp #{url + "trunk"} #{url + "tags/release-#{ver}"}}
	puts com
	puts "Tag to press any key."
	$stdin.gets
	sh com
end

desc "Create Documentation"
task :doc => ["doc/index.html"] do |t|
end

task :update do
	sh %{svn up}
end

file "jsdeferred.nodoc.js" => ["jsdeferred.js"] do |t|
	File.open(t.name, "w") {|f|
		f << mini(File.read("jsdeferred.js"), true)
	}
end

file "jsdeferred.mini.js" => ["jsdeferred.js"] do |t|
	File.open(t.name, "w") {|f|
		f << mini(File.read("jsdeferred.js"))
	}
end

file "jsdeferred.jquery.js" => ["jsdeferred.js", "binding/jquery.js"] do |t|
	File.open(t.name, "w") {|f|
		f << mini(File.read("jsdeferred.js") + File.read("binding/jquery.js"))
	}
end

file "jsdeferred.userscript.js" => ["jsdeferred.js", "binding/userscript.js"] do |t|
	File.open(t.name, "w") {|f|
		f.puts "// Usage:: with (D()) { your code }"
		f << mini(File.read("binding/userscript.js").sub("/*include JSDeferred*/", File.read("jsdeferred.js")), true)
	}
end

file "doc/index.html" => ["jsdeferred.js", "makedoc.rb"] do |t|
	sh %{ruby makedoc.rb}
end

