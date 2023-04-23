//Rocking Memory Script 
$(document).ready(function(){

//Game Object
var gameObject= {};
	gameObject = {
		config : {
			positions : [],
			color : ['red','green','blue','yellow','black']
			},
		init: function(config){
			// Creating 96 Icons Divs 
			for(var i=0;i<96;i++){
			   $('.gameArea').append('<div class="icon'+i+'"></div>');   
			}
			for(var j=127744;j<128511;j++){
				gameObject.config.positions.push('&#'+j+';');
			}
			$(".intro span:first-child").animate({top:300},500,function(){for(var i=3;i>0;i--){$(this).animate({top:'-='+(i*10)},100).animate({top:'+='+(i*10)},150);}
			$(".intro span:nth-child(2)").animate({left:665},300,function(){
			for(var i=2;i>0;i--){$(this).animate({left:'+='+(i*10)},100).animate({left:'-='+(i*10)},100);}
			$(".intro span:last-child").animate({left:720},500,function(){
			$(".intro").fadeOut(3000);setTimeout(function(){$(".entrance").fadeIn(1000);},3000);});});
		});
			$('body').on('click','.play',gameObject.play);
			$('body').on('click','.exit',gameObject.exit);
			$('body').on('click','div[class^=icon]',gameObject.iconClick);
			$('body').on('click','.retry',gameObject.retry);
			$('body').on('click','.menu',gameObject.menu);
			$('body').on('click','.help',gameObject.help);
			$('body').on('click','.back',gameObject.back);
		},
		// Random Image in Random Location Functionality, will be called Initially and afetr click of each icon.
		randomIcon: function randomIcon(){
			var random;
			//noprotect
			do{
				random=Math.floor(Math.random()*96); 
			}while($('.icon'+random).hasClass('old'));
			$('.icon'+random).html(gameObject.config.positions[Math.floor(Math.random()*gameObject.config.positions.length-1)]).addClass('sprite').css({'color':gameObject.config.color[Math.floor(Math.random()*5)]}); 
		},
		//Play the Game
		play : function play(){
			gameObject.randomIcon();
			gameObject.timeSpan(800,1);
			$('.gameWrap').show();
			$('.entrance').hide();
		},
		//Help for the Game
		help : function help(){
			$(this).parent().hide();
			$('.helpPage').show();
		},
		//Back button
		back : function back(){
			$(this).parent().hide();
			$('.entrance').show();
		},
		//Exit the Game?
		exit : function exit(){
			var c=confirm("Do you want to exit??");if(c==true){ window.open('','_self');window.close();}
		},
		// TimeSpan of 5 Seconds to select, or else Game Over. 
		timeSpan : function timeSpan(width,time){
			time = time || 1000;
			var level = $('.levelSelect input[type=radio]:checked').val(),levelTime = 5000;
			switch(level){
				case "easy" : levelTime = 10000;break;
				case "medium" : levelTime = 5000;break;
				case "hard" : levelTime = 3000;break;
			}
			setTimeout(function(){
				$('.timeSpan').stop(true).css({
					width: width || '100%'
				}).animate({
						width:0
					},levelTime,gameObject.gameOver);
			},time);
		},
		//Game Over Functionality.
		gameOver : function gameOver(){
			var oldLength = $('.old').length+1;
			$('.gameWrap').hide(); 
			$('.gameOver').show();
			$('.finalScore span').text($('.old').length+1);
			  if(localStorage){
					if(localStorage.best == null){
						localStorage.best = 1;
						if( localStorage.best < $('.old').length+1){
						localStorage.best = $('.old').length+1;
						}
					}
					else{
						if( localStorage.best < $('.old').length+1){
						localStorage.best = $('.old').length+1;
						}
					}
				 $('.bestScore span').text(localStorage.best);
				}else{
					$('.bestScore').hide();
				}
		},
		// on clicking each Icon, if it is the new one level increments, or else game over.
		iconClick : function iconClick(e){
			if($(this).hasClass('sprite')){
			if(!$(this).hasClass('old') && $('old').length < 96){  
			  $('.cover').animate({width:'100%'},'fast');
			  setTimeout(function(){ 
				$('.cover').animate({width:0},'fast');
				$('.level span').text($('.old').length+1);
				gameObject.randomIcon();
			  },1000);
			gameObject.timeSpan(null,1);		
			}else{
			  gameObject.gameOver();
			}
				$(this).addClass('old');
			}
		},
		// Retry functionality.
		retry : function retry(){
			$('.gameWrap').show(); 
			$('.gameOver').hide();
			$('.sprite').removeClass('sprite');
			$('.old').removeClass('old');
			$('div[class^=icon]').html('');
			$('.level span').text($('.old').length+1);
			gameObject.randomIcon(); 
			gameObject.timeSpan('100%',1);
			},
		menu : function menu(){
			$('.entrance').show();
			$('.gameOver').hide();
			$('.sprite').removeClass('sprite');
			$('.old').removeClass('old');
			$('div[class^=icon]').html('');
			$('.level span').text($('.old').length+1);
			}
		};
		
	gameObject.init();
});              