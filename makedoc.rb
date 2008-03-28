#!/usr/bin/env ruby

require "erb"
require "ostruct"

class JsDoc
	attr_reader :filename, :title, :functions

	def initialize(filename)
		@filename = filename
		@doc = []
		@functions = {}
		@title = ""
		parse()
	end

	def parse
		js = File.read(@filename)
		js.scan(%r{/\* (function[^\n]+|[^:]+::)(.+?)\*/}im) do |header, body|
			body.gsub!(/^ \* ?/, "")
			p header
			_, name, arg, retv = *%r{^function\s*(\S+)\s*\(([^)]*)\)\s*//\s*=>\s*(.+)}.match(header)
			if _
				#p [name, args, retv]
				_, req, opt = */([^\[\]]+)(?:\[, ([^\[\]]+)\])?/.match(arg)
				args = []
				args.concat(req.split(/,\s*/)) if req
				args.concat(opt.split(/,\s*/)) if opt
				@functions[name] = {
					:name => name,
					:arg  => arg,
					:args => args,
					:retv => retv,
				}
			end

			if body.match(/^(.+?)\ncopyright \(c\) \d{4}/i)
				@title = Regexp.last_match[1]
			end
			@doc << {
				:header => header,
				:name   => name,
				:body   => body,
			}
		end
	end

	def each_section(&block)
		@doc.each_with_index do |s, i|
			o = OpenStruct.new(s)
			o.body = parse_section(s)
			o.sid  = o.name || i
			yield o
		end
	end

	def parse_section(section)
		fun = @functions[section[:name]]

		parse_inline = lambda do |str|
			r = {"<"=>"lt", "&"=>"amp"}
			str.gsub!(/[<&]/) {|m|
				"&#{r[m]};"
			}
			str.gsub!(/`((?:\\`|[^`])+)`/) {|m|
				name = Regexp.last_match[1]
				case
				when fun[:args].include?(name)
					"<var>#{name}</var>"
				when @functions.key?(name)
					"<code><a href='##{name}'>#{name}</a></code>"
				else
					"<code>#{name}</code>"
				end
			}
			str
		end

		parse_block = lambda do |str|
			ret = []
			current = [nil, ""]
			str.each_line("\n") do |l|
				case l
				when /^    / # pre
					l = [:pre, l.sub(/^    /, "")]
				when /^\s*$/
					l = [current[0], l]
				else # p
					l = [:p, l]
				end

				if l[0] == current[0]
					current[1] << l[1]
				else
					ret << l
					current = l
				end
			end
			ret.map {|t,b|
				case t
				when :pre
					"<pre>#{b}</pre>"
				else
					"<p>#{parse_inline[b].gsub(/(?:\r?\n|\r){2}/, "</p>\n<p>")}</p>"
				end
			}.join("\n")
		end
		parse_block[section[:body]]
	end
end

require "pp"
doc = JsDoc.new("jsdeferred.js")
#doc.each_section do |s|
#	pp s
##	puts s.name
##	puts s.body
#end

include ERB::Util
File.open("doc/index.html", "wb") {|f| f << ERB.new(DATA.read).result(binding) }

__END__
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<title><%=h doc.title %></title>

		<style type="text/css">
			body {
				padding: 0 10% 10em;
				margin: 0;
				color: #333;
				line-height: 1.5;
			}

			h2 {
				font-size: 100%;
				margin: 3em 0 1.5em 0;
			}

			pre {
				font-size: 80%;
				background: #efefef;
				border: 1px solid #ddd;
				padding: 0.5em;
				line-height: 1.33;
				overflow: auto;
			}

			var {
				font-style: italic;
				font-weight: bold;
			}

			.body {
				padding: 0 0 0 2em;
			}

			.funname,
			.paren {
				font-weight: bold;
			}

			.args {
				font-weight: normal;
			}

			#footer {
				margin: 2em 0;
				text-align: right;
				font-size: 80%;
			}
		</style>
	</head>
	<body>
		<div id="whole">
			<h1><%=h doc.title %></h1>

			<% doc.each_section do |section| %>
			<div class="section" id="<%=h section.sid %>">
				<% fun = doc.functions[section.name] %>
				<% if fun %>
				<h2>
					<span class="funname">
						<%=h fun[:name] %>
					</span>
					<span class="paren">(</span>
					<span class="args"><%=h fun[:arg] %></span>
					<span class="paren">)</span>
					//=>
					<%=h fun[:retv] %>
				</h2>
				<% else %>
				<h2><%=h section.header %></h2>
				<% end %>
				<div class="body">
				<%= section.body %>
				</di>
			</div>
			<% end %>
		</div>
	</body>
</html>
