/********* START OF SCRIPT *********/

$(function(){

	//This is only for storing static and dynamic UI Elements
    const UIController = (() => {
        
        //Add static UI Elements here
        const DOMElements = {
            window : $(window),
            documentEle : $(document),
            document : document,
            bodyEle : $('body'),

            // Page blocks
            gameEle : $('.game'),
            resultEle : $('.statistics'),

            // Buttons
            allButtons : $('button'),
            playBtn : $('.play-btn'),
            mainMenuBtn : $('.main-menu-btn'),
            gameStatsBtn : $('.stats-btn'),
            fullscreenBtn : $('.full-screen-btn'),
			darkMode : $('#dark-mode'),

            // game elements
            gameArena : $('.game-arena'),
			gameIconsArena : $('.game-icons-arena'),
            progressBar : $('.time-span'),
			gameCover : $('.game-cover'),

            // Statstics & Audio elements
            levelEle: $('.level span'),
			finalScore : $('.statistics .final-score span'),
            highScore : $('.statistics .highest-score span'),

            //Dynamically added UI Elements should be handled as functions
           
            difficultySelect : function(dataset) {
                return $('input[name="difficulty"][type="radio"]:checked')[0];
            },
			randomIcons : function(){
				return $(`[data-icon=true]`);
			},
			emptyIcons : function() {
				return $(`[data-empty=true]`);
			}
        };

        // Return the DOMElements object to be used by controller function
        return {
            getDOMElements : () => DOMElements
        }
    })();

	// This is only for UI manipulation
    const gameController = (() => {
        return {

            // This will add html content to the element passed
            addContent : function (ele, content) {
                ele.html(content);
                return this;
            },

            // Empty the content for element passed
            emptyEle : function (ele) {
                ele.html('');
                return this;
            },

            //Add or remove the class for ele element. If there is no class to add, pass "addcls" as false
            addRemoveCls : function (ele, addcls, removecls){
                addcls && $(ele).addClass(addcls);
                removecls && $(ele).removeClass(removecls);
                return this;
            },

            // Change attribute value for an element
            attrChange : function (ele, atrname, atrval) {
                $(ele).attr(atrname, atrval);
                return this;
            },

            // Returns parent/s element for an element
            returnParent : function (ele, data) {
                if(data) {
                    return $(ele.parents(`.${data}`));
                }
                return $(ele.parent());
            },

            // Returns parent/s sibling element for an element
            returnParentSibling : function (ele, parent, sibling) {
                if(parent && sibling) {
                    return $(ele.parents(`.${parent}`).siblings(`.${sibling}`));
                }
            },

            // Add passed css json object for the element
            addCSS : function (ele, cssKey, cssValue) {
                ele.css(cssKey, cssValue);
                return this;
            },

            // append html content
            appendHTML : function (ele, content) {
                ele.append(content);
                return this;
            }
        }
    })();

	// GLOBAL APP CONTROLLER
    const controller = ((gameCtrl, UICtrl) => {

        // Storing DOM elements
        const DOM = UICtrl.getDOMElements();

        // Setting initial values for gameObj, which will be created by gameObject class, once game is started
        const gameObj = {
            start : null,
            over : false,
            level : 0,
			positions: [],
			timeLimit : 10000,
			color : ['red','green','blue','yellow','black'],
            highScoreLocalStorage : function(key, score) {
                localStorage && localStorage[key] ? localStorage[key] < score ? localStorage[key] = score : null  : localStorage[key] = score;
            }
        };

        // game object class
        class gameObject {
            constructor() {
                
                // Random Number Generator
                this.randomGenerator = function (num) {
                    return Math.floor(Math.random()*num)
                }

				this.createIcons = function () {
					for(let i=0; i < 96; i++ ){
						gameCtrl.appendHTML(DOM.gameIconsArena, `<div data-icon=true data-old=false data-random=${i} data-empty=true></div>`);  
					}
					for(let j=127744; j < 128511; j++){
						gameObj.positions.push('&#'+j+';');
					}
				}

				// Random Image in Random Location Functionality, will be called Initially and afetr click of each icon.
				this.randomIcon = function (){
					let dataRandom;

					dataRandom = $(DOM.emptyIcons()[this.randomGenerator(DOM.emptyIcons().length)]);
					gameCtrl.addContent(dataRandom, gameObj.positions[this.randomGenerator(gameObj.positions.length-1)])
							.addCSS(dataRandom, 'color' , gameObj.color[this.randomGenerator(5)])
							.attrChange(dataRandom,'data-empty', false);
				}

				// TimeSpan based on difficulty level to select, or else Game Over. 
				this.timeSpan = function (){
					gameObj.timeLimit = +DOM.difficultySelect().dataset.time;
					DOM.progressBar.stop();
                    gameCtrl.addCSS(DOM.progressBar, 'width','100%');
					setTimeout(() => {
						DOM.progressBar.animate({
							'width' : 0
						},gameObj.timeLimit, this.resetGame);
					},500);
				}

				// This will reset all the values to beginning values
				this.resetGame = function() {
					$('[data-old=false][data-empty=false]').animate({opacity: 1, fontSize: '+=0.5rem'},'fast').animate({opacity: 0.5, fontSize: '-=0.5rem'},'fast');
                    
                    setTimeout(() => {
                        gameObj.highScoreLocalStorage("rockingMemoryHighScore", gameObj.level);
	
                        DOM.progressBar.stop();
                        if(DOM.gameEle.is(':visible')){
                            gameCtrl.addRemoveCls(DOM.gameEle,'d-none','d-block')
                                    .addRemoveCls(DOM.resultEle,'d-block','d-none');
                        }
                        gameCtrl.emptyEle(DOM.gameIconsArena)
                                .addContent(DOM.highScore, localStorage['rockingMemoryHighScore'])
                                .addContent(DOM.finalScore, gameObj.level)
                        gameCtrl.addCSS(DOM.progressBar, 'width', '100%');

                        // Setting back the gameObj to original values
                        gameObj.level = 0;
                        gameObj.over = true;
                    },1000);
				}

				// on clicking each Icon, if it is the new one level increments, or else game over.
				this.iconClick = function (event){
					let currentIcon = event.target;
					if(currentIcon.dataset.old != 'true'){
						DOM.gameCover.animate({'width':'100%'});
						this.timeSpan();
						setTimeout(() => {
							DOM.gameCover.animate({'width':0});
							gameCtrl.addContent(DOM.levelEle, ++gameObj.level);
							this.randomIcon()
						},1000);
					}
					else {
                        this.resetGame();
					}
					gameCtrl.attrChange(currentIcon,'data-old', true);
				}
            }
        }

        // This functions is for all User interactions events
        const setupEvents = () => {

			// Dark mode 
            DOM.darkMode.on('change', () => {
                if(this.activeElement.checked) {
                    gameCtrl.addRemoveCls(DOM.bodyEle, 'bg-dark dark-mode', 'bg-light');
                }
                else {
                    gameCtrl.addRemoveCls(DOM.bodyEle, 'bg-light', 'bg-dark dark-mode');
                }
            });

            // Force landscape mode
            DOM.fullscreenBtn.on('click',function(){
                let de = DOM.document.documentElement;
                if(this.dataset.fullscreen === 'off'){
                    if(de.requestFullscreen){
                        de.requestFullscreen();
                    }
                    else if(de.mozRequestFullscreen){de.mozRequestFullscreen();}
                    else if(de.webkitRequestFullscreen){de.webkitRequestFullscreen();}
                    else if(de.msRequestFullscreen){de.msRequestFullscreen();}
                    screen.orientation.lock('landscape');
                    gameCtrl.attrChange($(this),'data-fullscreen','on');
                    gameCtrl.addContent($(this),'Exit Full Screen');
                }
                else {
                    screen.orientation.unlock();
                    if(DOM.document.fullscreen){
                        DOM.document.exitFullscreen();
                    }
                    gameCtrl.attrChange($(this),'data-fullscreen','off');
                    gameCtrl.addContent($(this),'Full Screen');
                }
            });

            // Hide current page and show specific page for all buttons
			DOM.allButtons.on('click', function(event) {
                event.preventDefault();

                if( this.dataset.parent && this.dataset.show ) {
                    gameCtrl.addRemoveCls(gameCtrl.returnParentSibling($(this), this.dataset.parent, this.dataset.show), 'd-block', 'd-none')
                            .addRemoveCls(gameCtrl.returnParent($(this), this.dataset.parent), 'd-none', 'd-block');
                }
                
            });

            // Start the Game everytime Play button is clicked
            DOM.playBtn.on('click', function(event){
				gameObj.start = gameObj.start || new gameObject();
                gameObj.over = false;
				gameCtrl.addContent(DOM.levelEle, gameObj.level);
				gameObj.start.createIcons();
				gameObj.start.randomIcon();
				gameObj.start.timeSpan();
            });

            //Updating game statstics in page
            DOM.gameStatsBtn.on('click', () => {
                gameCtrl.addContent(DOM.highScore, localStorage['rockingMemoryHighScore']);
            });

			DOM.documentEle.on('click','[data-icon=true][data-empty=false]', function(event){
				gameObj.start.iconClick(event);
			});

        };
        
        // returning only init function
        return {
            init: () => {
                console.info('Welcome to %cROCKING MEMORY GAME', "color: yellow; font-weight: bold; background-color: blue;padding: 2px");
                setupEvents();
            }
        }
    })(gameController, UIController);

    // init function triggers setupEvents, which has events functions.
    controller.init();
});

/********* END OF SCRIPT *********/
         