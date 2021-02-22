// Πρέπει να μπει στο $(document).ready κάνει όλα τα input[text] που έχουνε class auto_clear να καθαρίζονται όταν τα πατάς
// Θέλει να έχουνε και ένα attr st_value με το default value
function auto_clear()
{
	if( Modernizr && !Modernizr.input.placeholder ){
		var $pHolder = $('[placeholder]');
		$pHolder.each(function(index,el){$(element).attr('value',$(element).attr('placeholder'));})
		$pHolder.focusin(function() { 	if($(this).attr('value') == $(this).attr('placeholder')){$(this).attr('value','')}});
		$pHolder.focusout(function() { if($(this).attr('value') == ''){$(this).attr('value',$(this).attr('placeholder'))}});
	}
}

jQuery.fn.checkField = function(){

	var T = this;

	var type = T.is('input') ? T.attr('type') : (T.is('textarea') ? "textarea" : (T.is('select') ? "select" : ''));
	if(type== '') { return false;}

	var required = T.is('.required');
	var val = T.val();
	var valLength = val.length;
	var label = $("label[for='"+T.attr('id')+"']").html();
	var fieldStatus = '';
	var flashClass = 'flash';
	var text = '' ;

	switch (type){
		case "text":
			if( required && valLength < 1 )  { fieldStatus = "empty"; }
			else if( T.is('.mail') && !checkemail(val)){ fieldStatus = "invalid"; text = L("invalid_email"); }
			break;
		case "password":
			if( required && valLength < 1 )  { fieldStatus = "empty"; }
			break;
		case "textarea":
			if(required && valLength < 1)    { fieldStatus = "empty"; }
			break;
		case "select":
			if(required && valLength < 1)    { fieldStatus = "empty"; }
			break;
		case "checkbox":
			if(required && !T.is(":checked")){ fieldStatus = "empty"; }
			break;
		case "radio":
			if($("[name='"+ T.attr('name') + "'].required")[0] !== undefined){
				if($("[name='"+ T.attr('name') + "']:checked")[0] === undefined)
				{ fieldStatus = "empty"; }
			}
			break;
	}
	var $match =$('#'+T.attr('id')+'_match');
	if($match[0]!== undefined){
		if($match.val() != T.val()){
			var matchLabel = $("label[for='"+$match.attr('id')+"']").html();
			fieldStatus = 'invalid';
			text = L("fields_must_much",[label,matchLabel]);
		}

		/*
		 case "url":
		 if(required && valLength < 1)   { fieldStatus = "empty"; }
		 else if (!checkURL(val))        { fieldStatus = "invalid"; text = L("invalid_url")}
		 break;
		 */
	}

	if(fieldStatus == ''){ T.removeClass(flashClass+" "+flashClass+"-empty "+flashClass+"-invalid"); return true; }
	else {
		if( text == '') { text = L("required_field",[label]); }
		T.trigger('focus').addClass(flashClass+" "+flashClass+"-"+fieldStatus);
		if(jQuery.fn.tooltip){ T.tooltip(text,"rl"); } else { alert(text); }
		return false;
	}
};

jQuery.fn.checkForm = function(){
	var T = this;
	if(!T.is('form')) { return false;}
	var flag = true;
	var label;
	T.find('input:visible,textarea:visible,select:visible').each(function(index, element){
		if(flag && !$(element).checkField()){ flag =  false; }
	});

	return flag;
};

// check mail
function checkemail(mail)
{
	return mail.search(/^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i ) >= 0;
}

// check url
function checkURL(url)
{
	return url.search(/(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/) >= 0;
}

// Send Form
function send_form(e) {
	prevDef(e);
	$tar = $(e.currentTarget);
	if($tar.checkForm())
	{
		var inputs = new Array();
		var form_type = $tar.attr('data-type') || $tar.attr('id');

		$tar.find("input,select,textarea").each(function(index, element) {
			var $el = $(element);
			var elType  = $el.is('input') ? $el.attr('type') : ($el.is('select') ? 'select' : ( $el.is('textarea') ? 'textarea' : '' ) );
			var elVal   = $el.val();
			var elChecked = $el.is(":checked");
			if($el.is(":visible"))
			{
				switch (elType)
				{
					case 'text':
						if(elVal!=''){ inputs.push($el.attr('id'));  }
						break;
					case 'password':
						if(elVal!=''){ inputs.push($el.attr('id'));  }
						break;
					case 'radio':
						if(elChecked) { inputs.push($el.attr('id')); }
						break;
					case 'checkbox':
						if(elChecked) { inputs.push($el.attr('id')); }
						break;
					case 'select':
						if(elVal!=''){ inputs.push($el.attr('id'));  }
						break;
					case 'textarea':
						if(elVal!=''){ inputs.push($el.attr('id'));  }
						break;
				}
			}

		});
		inputs = '#'+inputs.join(';');
		var d = new Date();
		var date = d.getDate()+'_'+(d.getMonth()+1)+'_'+(d.getFullYear());
		var time = (d.getUTCHours()+2)+'_'+d.getUTCMinutes();
		acp($tar.attr("action")+'?form='+form_type+inputs,'POST','',function(data)
		{
			data = JSON.parse(data);
			if(errorLess(data)){
				inputs = inputs.replace(/;/g,',#');
				$(inputs).attr('value','');
				olert(L('message_send'));
			}
		})
	}
}



/// Προσθέτει tooltip...
jQuery.fn.tooltip = function(text,pos,duration,classes)
{
	var T = this;
	pos = (pos === undefined) ? 'trbl' : pos; // Default is 'auto' (trbl)
	if(typeof pos == 'number'){ classes = duration; duration = pos; pos="trbl"; }
	if(typeof duration == 'string') { classes = duration; duration = null;}
	classes = classes || '';
	var classAttr = (classes !== '')?'class="'+classes+'"': ''; // Add Optional Classes...

	duration = (!isNaN(duration) && duration!=null) ? duration : ((text.count(' ')+1)*1500); // If duration is not Defined it is computed by the text's words
	if($('#tooltip')[0]===undefined){ $('body').append('<div id="tooltip" '+classAttr+' ></div>'); }  // Set it up
	else { $('#tooltip').attr("class",classes); }
	var $tooltip = $('#tooltip');
	$tooltip.html(text);
	//  All the dimensions needed...
	var w = parseFloat($tooltip.outerWidth());
	var h = parseFloat($tooltip.outerHeight());
	var objW = T.outerWidth();
	var objH = T.outerHeight();
	var objDim = { "t":T.offset().top , 'r': T.offset().left + objW ,'b': T.offset().top + objH ,'l': T.offset().left };

	for( var i in objDim ) { objDim[i] = parseInt( objDim[i] ); }

	var left = 0, top = 0;

	function _autoPosition(){
		var space = {
			't' :   objDim.t - $(window).scrollTop(),
			'r' :   ( $(window).width() - objDim.r ) + $(window).scrollLeft(),
			'b' :   $(window).height() - ($(window).scrollTop() - objDim.b),
			'l' :   objDim.l - $(window).scrollLeft()
		};
		var wRemain = (w - objW)/2;
		var hRemain = (h - objH)/2;

		for( var i = 0; i<pos.length;i++ ){
			switch (pos[i]){
				case 't':
					if(h < space.t && wRemain < space.l && wRemain < space.r ){ return 't';}
					break;
				case 'r':
					if(w < space.r && hRemain < space.t && hRemain < space.b ){ return 'r'; }
					break;
				case 'b':
					if(h < space.b && wRemain < space.l && wRemain < space.r ){ return 'b';}
					break;
				case 'l':
					if(w < space.l && hRemain < space.t && hRemain < space.b ){ return 'l';}
					break;
			}
		}

		return 't';
	}

	if(pos.search(/^(t|tr|r|br|b|bl|l|tl)$/) < 0){ pos = _autoPosition();}

	switch (pos){
		case 't':
			left = parseInt(objDim.l + objW/2 - w/2);
			top = parseInt( objDim.t - h);
			break;
		case 'tr':
			left = parseInt(objDim.l + objW);
			top = parseInt( objDim.t - h);
			break;
		case 'r':
			left = parseInt(objDim.l + objW);
			top = parseInt( objDim.t + objH/2 - h/2);
			break;
		case 'br':
			left = parseInt(objDim.l + objW);
			top = parseInt( objDim.t + objH );
			break;
		case 'b':
			left = parseInt(objDim.l + objW/2 - w/2);
			top = parseInt( objDim.t + objH );
			break;
		case 'bl':
			left = parseInt(objDim.l - w);
			top = parseInt( objDim.t + objH );
			break;
		case 'l':
			left = parseInt(objDim.l - w);
			top = parseInt( objDim.t + objH/2 - h/2);
			break;
		case 'tl':
			left = parseInt(objDim.l - w);
			top = parseInt(objDim.t - h);
			break;
		default :

			break;
	}

	T.leave = function(){
		if(tooltipInterval){ window.clearInterval(tooltipInterval); }
		$tooltip.stop(true,false).animate({'opacity':0},300).remove();
	};

	T._check = function(){
		if(!T.closest('html').length){
			T.leave();
		}
	}

	$("#tooltip").css({"display":"block","left":left,"top":top});
	$("#tooltip").addClass('position-'+pos);

	$tooltip.one('click', T.leave);

	var tooltipInterval = window.setInterval(T._check,300);
	$tooltip.stop(true,false).animate({'opacity':1},300,function(){
		if(duration > 0){
			$tooltip.delay(duration * .5).animate({'opacity':0},(duration * .5), function(){$tooltip.unbind('click')});
		}
	});

	return T;
};

var tooltipController = function(attr, cl){

	attr = attr || 'data-tooltip';
	var checker = (cl!== undefined)?("."+cl):('['+attr+']');

	function tooltipCheck(e){
		var $tar = $(e.target);
		var tooltipClass = $tar.attr('data-tooltip-class') || '';
		var removeTooltip = function(){
			if($tar.is(checker)){ $tar.leave(); }
		};
		if($tar.is(checker)){
			var text = $tar.attr(attr);
			$tar.tooltip(text,0,tooltipClass);
			$(ie ? document : window).unbind('mouseout',removeTooltip).one('mouseout',removeTooltip);
		}
	}

	$(ie ? document : window).unbind('mouseover',tooltipCheck).bind('mouseover',tooltipCheck);

}("data-tooltip");



function olert(text){
	if($("#olertWrapper")[0] === undefined){
		$('body').append("<div id='olertWrapper'><div id='olert'><div id='olertText'></div><input type='button' id='olertButton' value='OK'></div></div>");
	}
	var $wrap = $("#olertWrapper");
	var $olert = $("#olert");
	var $olertText = $("#olertText");
	var $olertButton = $("#olertButton");
	this.closeOlert = function () {$("#olertWrapper,#olertButton").unbind('click',closeOlert) ; $wrap.remove();}
	$("#olertWrapper,#olertButton").unbind('click',closeOlert).bind('click',closeOlert);
	$olertText.html(text);
}

jQuery.fn.sw_class = function(class1,class2)
{
	if($(this).hasClass(class1)){$(this).removeClass(class1).addClass(class2);}
	else{$(this).removeClass(class2).addClass(class1);}
};


jQuery.fn.fadeoutanddie = function (delay,callback)
{
	delay = (delay !==undefined)?delay:500;
	$(this).animate({"opacity":0},delay,function(){$(this).remove(); if(callback){callback.call();}});
};

jQuery.fn.fadeoutandstay = function (delay,callback)
{
	delay = (delay !==undefined)?delay:500;
	$(this).animate({"opacity":0},delay,function(){$(this).css({'display':'none'}); if(callback){callback.call();}});
};

/* TODO Obsolete??
 jQuery.fn.fadein = function (delay,callback)
 {
 $(this).addClass('trans_op_500');
 var t = $(this);
 $(this).wait_css_trans(function(){ $(t).css({'display':'block'});$(t).removeClass('trans_op_500');});
 $(this).css({'opacity':1});
 };
 */

jQuery.fn.adjustAndShow = function(callback)
{
	var T = this;
	var new_height = T.height() + 'px';
	var $par = T.parent();
	$par.animate({'height':new_height},200,
		function () {T.animate({'opacity':1},300,function(){if(callback){callback();}})
			$par.css({'height':'auto'});
		});

}

jQuery.fn.adjustAndHide = function(callback)
{
	var T = this;
	var $par = T.parent();
	var height = $par.height() + 'px';
	$par.height(height);
	T.animate({'opacity':0},300,function(){if(callback){callback.call(T);}});
}

ImgPreloader = function () {

	var T = this;
	T.stopped = false;
	T.images = new Array();

	T.loadImages = function (imgs, start) {
		T.images = imgs;
		if (start >= 0 && start < imgs.length) {
			T.startLoading(start);
		}
	};

	T.startLoading = function (start) {
		var tmpImg = new Image();
		$(tmpImg).unbind('load').bind('load', function () {
			T.loadNext(start);
			T.loadPrev(start)
		});
		tmpImg.src = T.images[start];

	};

	T.loadNext = function(index){
		if(index >= 0 && index < T.images.length){
			var tmpImg = new Image();
			$(tmpImg).unbind('load').bind('load', function () {
				if(!T.stopped){  T.loadNext(index) }
			});
			tmpImg.src = T.images[index];
			T.loaded(tmpImg,T.images[index]);
			index++;
		}
	};

	T.loadPrev = function(index){
		index--;
		if(index >= 0 && index < T.images.length){
			var tmpImg = new Image();
			$(tmpImg).unbind('load').bind('load', function () {
				if(!T.stopped){     T.loadPrev(index) }
			});
			tmpImg.src = T.images[index];
			T.loaded(tmpImg,T.images[index]);
		}
	}

	T.stop = function()
	{
		T.stopped = true;
		T.loaded = function(){}
	}

}

ImgPreloader.prototype.loaded = function(img,src){ /* loaded  */}

function Cycle($items, func, index, interval)
{ var T = this;
	T.$items = $items;
	T.numOfItems = T.$items.length;
	T.interval = (interval!==undefined)?interval:1000;
	T.index = index || 0
	T.eternal = '';
	T.func = func;

	T.cycleIt = function(){
		T.func.call(T.$items[T.index]);
		T.index  = (T.index < (T.numOfItems-1))? T.index+1:0;
		T.eternal = setTimeout(T.cycleIt, T.interval);
	};

	T.stop = function(){window.clearTimeout(T.eternal);}
	T.pause = function(){window.clearTimeout(T.eternal);}
	T.resume = function(i){T.index = (i!==undefined)?((i < (T.numOfItems)?i:0)):T.index;T.eternal = setTimeout(T.cycleIt, T.interval);}
}

function Fiterate(items, func,index, interval, callBack)
{
	var T = this;
	T.items = items;
	T.numOfItems   = T.items.length;
	T.interval = (interval!==undefined)?Math.floor(interval):1000;
	T.index = index || 0;
	T.func = func;
	T.eternal  = '' ;
	T.callBack = callBack;

	T.fiteIt = function(){
		if(T.index <T.numOfItems){
			T.func.call(T.items[T.index]);
			T.index++;
			T.eternal = setTimeout(T.fiteIt, T.interval);
		} else if(T.index == T.numOfItems) {if(T.callBack){ T.callBack();}}
	}

	T.stop = function(){window.clearTimeout(T.eternal);}
	T.pause = function(){window.clearTimeout(T.eternal);}
	T.resume = function(i){T.index = (i!==undefined)?((i < (T.numOfItems)?i:0)):T.index;T.eternal = setTimeout(T.cycleIt, T.interval);}
	T.restart = function(){T.index = 0;T.fiteIt();}
}

String.prototype.count=function(s1) {
	return (this.length - this.replace(new RegExp(s1,"g"), '').length) / s1.length;
}

jQuery.fn.noticeIn = function(txt,classes,delay){
	var T = this;
	classes = (classes !== undefined)?'class="'+classes+'"': '';
	var words = txt.count(' ');
	delay = delay || (words*1000 + 2000);
	var $notice ='';
	if($('#noticeIn')[0]===undefined){
		$notice =  $('<div id="noticeIn" style="opacity: 0;position:absolute; margin: auto; display:inline-block;" '+classes+' ><div style="display:inline-block; position:relative;" id="noticeInText"></div></div>');
	} else {
		$notice = $('#noticeIn');
	}
	T.append($notice);
	var $noticeIn = $notice.find('#noticeInText');
	$noticeIn.html(txt);
	var h = parseFloat(window.getComputedStyle($noticeIn[0],null).getPropertyValue("height"));
	var w = parseFloat(window.getComputedStyle($noticeIn[0],null).getPropertyValue("width"));
	$notice.css({'width':Math.ceil(w),"height":Math.ceil(h)});
	$notice.css({ 'top':0,'left':0,'right':0,'bottom':0});
	$notice.unbind('click').bind('click',function(){$notice.unbind('click');$notice.remove();});
	$notice.stop().animate({'opacity':1},200,function(){
		$notice.animate({'opacity':0},delay,function(){
			$notice.unbind('click');
			$notice.remove();
		});
	});
}

function sel(e) {
	var el = e.target || e;
	var $tar = $(el).is('li')?$(el):$(el).parents('li');
	var $par = $tar.parents("ul,ol");
	if ($par.is(".selable")) {
		if ($tar.is(".sel") && $tar.find('.sel')[0] === undefined && $tar.find('li')[0]!==undefined) {
			$tar.removeClass("sel");
		}
		else {
			$par.find("li.sel").removeClass("sel");
			$tar.addClass("sel");
			$tar.parents("li").addClass("sel");
		}
	}
}

jQuery.fn.selMe = function(){sel(this);}


var errorLess = function (errorData, duration) {
	if (errorData.error === undefined) {
		return true;
	}
	olert(errorData.error.text);
	if (errorData.error.extras !== undefined) {
		if (errorData.error.extras.script !== undefined)
			eval(errorData.error.extras.script);
	}
	return false;
};