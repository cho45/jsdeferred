
require "rubygems"
require "rake"
require "rake/clean"
require "pathname"
require "net/http"


JSDOC = Pathname.new("~/app/jsdoc-toolkit").expand_path
CLEAN.include ["jsdeferred.{nodoc,jquery,userscript}.js"]
RELEASES = %w(
	jsdeferred.js
	jsdeferred.nodoc.js
	jsdeferred.jquery.js
	jsdeferred.userscript.js
	doc/index.html
)
CONTENT = File.read("jsdeferred.js")
Version = CONTENT[/@version\s+(\d+\.\d+\.\d+)/, 1]
Site    = CONTENT[/http:.+/]

COPYRIGHT = <<EOS
JSDeferred #{Version} Copyright (c) 2007 cho45 ( www.lowreal.net )
See #{Site}
EOS

def mini(js, commentonly=true)
	js = js.dup
	if commentonly
		js.gsub!(%r|\n?/\*.*?\*/|m, "")
		js.gsub!(%r|\n?\s*//.*|, "")
		js.gsub!(/\A\s+|\s+\z/, "")
	else
		uri = URI.parse('http://closure-compiler.appspot.com/compile')
		req = Net::HTTP::Post.new(uri.request_uri)
		req.set_form_data({
			'js_code'           => js,
			'compilation_level' => 'SIMPLE_OPTIMIZATIONS',
			'output_format'     => 'text',
			'output_info'       => 'compiled_code',
		})

		js = Net::HTTP.start(uri.host, uri.port) {|http| http.request(req).body }
	end
	COPYRIGHT.gsub(/^/, "// ") + js
end

def test_doc
	require 'rubygems'
	require 'net/http'
	require 'json'

	uri = URI.parse('http://closure-compiler.appspot.com/compile')
	req = Net::HTTP::Post.new(uri.request_uri)
	req.set_form_data([
		['output_format'     , 'json'],
		['output_info'       , 'compiled_code'],
		['output_info'       , 'warnings'],
		['output_info'       , 'errors'],
		['compilation_level' , 'SIMPLE_OPTIMIZATIONS'],
		['warning_level'     , 'default'],
		['output_file_name'  , 'jsdeferred.js'],
		['js_code'           , File.read('jsdeferred.js')],
	])

	res = Net::HTTP.start(uri.host, uri.port) {|http| http.request(req) }

	dat = JSON.parse(res.body)
	if dat['serverErrors']
		p dat['serverErrors']
		exit 1
	end

	puts 'http://closure-compiler.appspot.com' + dat['outputFilePath']
	code = dat['compiledCode']
	if dat['warnings']
		dat['warnings'].each do |m|
			puts "#{m['type']}: #{m['warning']}"
			puts "line: #{m['lineno']}, char: #{m['charno']}"
			puts m['line']
			puts
		end
	end
	if dat['errors']
		dat['errors'].each do |m|
			puts "#{m['type']}: #{m['error']}"
			puts "line: #{m['lineno']}, char: #{m['charno']}"
			puts m['line']
			puts
		end
	end
end

task :default => [:test]
task :create  => RELEASES

desc "Test JSDeferred"
task :test => RELEASES do
	# sh %{rhino -opt 0 -w -strict test-rhino.js jsdeferred.js}
	sh %{node test-node.js}
	test_doc
end

desc "Make all release file and tagging #{Version}"
task :release => [:update, :clean, :test] do
	ENV["LANG"] = "C"

	ver = Version
	puts "Releasing:: #{ver}"

	st = `git status`
	unless st =~ /nothing to commit/
		puts "Any changes remain?"
		puts st
		exit
	end

	tag = "release-#{ver}"

	sh %|git tag #{tag}|
	sh %|git push --tags|
end

task :npm => [:clean, :test] do
	require 'json'
	data = JSON.parse(File.read('package.json.tmpl'))
	data['version'] = Version
	File.open("package.json", "w") do |f|
		f.puts JSON.pretty_generate(data)
	end
	puts File.read("package.json")
	print "Sure publishing to npm repository? [yN]: "
	if $stdin.gets =~ /y/i
		puts "publishing..."
#		# sh %{npm publish .}
	end
end

desc "Create Documentation"
task :doc => ["doc/index.html"] do |t|
end

task :update do
	sh %{git pull}
end

task :setupdb do
	unless JSDOC.exist?
		JSDOC.parent.mkpath
		Dir.chdir '/tmp' do
			sh %{wget http://jsdoc-toolkit.googlecode.com/files/jsdoc_toolkit-2.3.2.zip}
			sh %{unzip jsdoc_toolkit-2.3.2.zip}
			sh %{mv jsdoc_toolkit-2.3.2/jsdoc-toolkit #{JSDOC}}
		end
	end
end

file "jsdeferred.nodoc.js" => ["jsdeferred.js"] do |t|
	File.open(t.name, "w") {|f|
		f << mini(File.read("jsdeferred.js"))
	}
end

file "jsdeferred.mini.js" => ["jsdeferred.js"] do |t|
	File.open(t.name, "w") {|f|
		f << mini(File.read("jsdeferred.js"), false)
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
		f << mini(File.read("binding/userscript.js").sub("/*include JSDeferred*/", File.read("jsdeferred.js")))
		f.puts "// End of JSDeferred"
	}
end

file "doc/index.html" => ["jsdeferred.js", "doc/template/class.tmpl", "doc/template/publish.js"] do |t|
	if JSDOC.exist? && system('which java')
		sh %{java -jar #{JSDOC}/jsrun.jar #{JSDOC}/app/run.js -s -d=doc -t=doc/template jsdeferred.js}
	else
		warn "java is not installed or #{JSDOC} is not exists."
	end
end

