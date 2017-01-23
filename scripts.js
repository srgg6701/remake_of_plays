/**
 * Created by User on 23.11.2016.
 * Эта функция осуществляет получение данных из jsons и сохраняет их в поля key объекта window
 */
var playsModel = Backbone.Model.extend(
    {
        initialize: function (urlTitle) {
            this.promisedData = this.getTemplatesContents(urlTitle);
        },
        // will save promise
        /**
         * "Xmarine", prime_block
         * @param key
         * @param prime_block
         */
        getTemplatesContents: function (key) {
            var _this = this,
                defer = $.Deferred();
            getData(key);  // Получает данные из json (асинхронно) и сохраняет в window[key]
            checkJsonData(key).then( // Проверка наличия этих данных, затем /-
                function (play_object) { // данная функция - это defer.resolve, вызываемая в теле checkJsonData
                    _this.set('jsonData', play_object);
                    defer.resolve(_this.get('jsonData'));
                },
                function (mes) {
                    console.log(mes);
                }
            );
            return defer.promise();
        }
    }
);

var events = Backbone.View.extend({
    events: {

    }
});

var pages = {};

$('body').on('click', '.arrow', function(event){
    console.log('%cInitialized, clicked!', 'color:blue', {event:event, this:this});
    var newNumber, urlParams = location.href.split('/'), urlTitle = urlParams[4],
        partName = urlParams[5], currentIndex, newIndex;
    for(var i=0; i < config.pages[urlTitle].length; i++){
        //console.log("config.pages[urlTitle][i] в цикле: ", config.pages[urlTitle][i]);
        if(config.pages[urlTitle][i]==partName){
            currentIndex=i;
            break;
        }
    }
    //console.log("После цикла partName: ", partName, " currentIndex: ", currentIndex);
     //   currentNumber = Number(location.href.split('/').pop().split('_').pop());
    //console.log(cinfig.pages(urlTitle));
   /* */switch(event.target.innerText){
        case "◄":
            if(currentIndex==0){
                newIndex = config.pages[urlTitle].length-1;
                //currentIndex=window[urlTitle]["Parts"].length-1;
            }else{
                newIndex = currentIndex-1;
            }
            break;
        case "►":
            if(currentIndex==window[urlTitle]["Parts"].length-1){
                newIndex=0;
            }
            else{
                newIndex = currentIndex+1;
            }
            break;
    }
    //console.log("arrow: ", event.target.innerText, ", new index: ", newIndex);
    urlParams[5]=config.pages[urlTitle][newIndex];
    console.log(urlParams[5]);
    location.href="#in_the_plays/"+urlTitle+"/"+config.pages[urlTitle][newIndex];
    /* locationStr = "in_the_plays/", // substr
        pos = location.href.indexOf(locationStr),
      http://127.0.0.1:8080/#in_the_plays/Xmarine/Part_1.5
     var nm = Number(location.href.split('/').pop().split('_').pop())
     => 1.5
     *
        varsString = location.href.substring(pos + locationStr.length),
        vars = varsString.split("/Part_"),
        urlTitle = vars[0],
        currentNumber = vars[1];*/
    //console.log("%cmakeReadyView instance", 'background-color:yellow', {this:this, 'this.el':this.el, 'this.$el':this.$el, varsString:varsString});
    /* currentNumber становится равне 1.1, в цикле while сразу при нулевом индексе
     window[urlTitle]["Parts"][index]["number"] равен 1.1, цикл while не идет.*/
    /*
     while (window[urlTitle]["Parts"][index]["number"] != currentNumber) {
     //console.log(window[urlTitle]["Parts"][index]["number"]);
     index++;
     }
     //console.log("index перед switch: ", index);
     switch(event.target.innerText){
     case "◄":
     if(index==0){
     index=window[urlTitle]["Parts"].length-1;
     }else{
     index--;
     }
     console.log("Попали назад.");
     break;
     case "►":
     if(window[urlTitle]["Parts"].length-1){
     index=0;
     }
     else{
     index++;
     }
     console.log("Попали вперед.");
     break;
     }
     console.log("newIndex: ", index); // Всегда 0.
     //console.log(event.target.innerText);
     //console.log(index);
     newNumber = window[urlTitle]["Parts"][index]["number"];
     location.href = "/#in_the_plays/"+urlTitle+"/Part_"+newNumber;
     *
     * */
});

var makeReadyView = Backbone.View.extend(
    {
        events: {
            //В event входит иерархия элементов от явно указанного (dynamicContent) до самого вложенного
            // в кликнутый элемент.
            'click .choicePlay': function (event) {
                var newUrlTitle;
                switch (event.target.innerText) {
                    case "X-marine":
                        newUrlTitle = "Xmarine";
                        break;
                    case "Black parody":
                        newUrlTitle = "Black_parody";
                        break;
                }
                location.href = "#in_the_secondary/" + newUrlTitle;
            }
        },
        el:'#dynamicContent',
        ready_element:'',
        initialize:function (templ, data) {
            //console.trace('makeReadyView.initialize, arguments=>', {templ:templ, data:data, this: this});
            this.render(templ, data);
        },
        render: function (templ, data) {
            this.ready_element = _.template(templ)(data); // templ = prime_block снаружи этой функции
            return this;
        }

    }
);

var settingColors = Backbone.View.extend(
    {
        el: '#dynamicContent',
        // former paintSecondary:
        initialize: function (urlTitle, otherUrlTitle, secondElems) {
            $("body") // jQuery object, где HTML объект body представлен в поле с ключом 0
                ['removeClass']("backgroundFor" + otherUrlTitle)
                .addClass("backgroundFor" + urlTitle);
            //console.log(secondElems);
            for (var c = 0, l = secondElems.length; c < l; c++) {
                var elem = $("#" + secondElems[c]);
                elem.removeClass(secondElems[c] + otherUrlTitle);
                elem.addClass(secondElems[c] + urlTitle);
            }
        }
    }
);

var $dynamicContent = $("#dynamicContent"),
    showLoading = function () {
        $dynamicContent.html('<h2>Loading...</h2>');
    },
    defaultView = Backbone.View.extend({
        initialize: function () {
            showLoading();
        }
    }),
    default_view = new defaultView();
var AppRouter = Backbone.Router.extend({
    routes: {
        "": "initView",
        "in_the_secondary/:urlTitle": "loadSecondary",
        "in_the_plays/:urlTitle/about_characters": "loadPlays",
        "in_the_plays/:urlTitle/Part_:currentNumber": "loadPart"
    },
    initView: function () {
        var file_path = "templates/primary/", prime_blocks = {prime_blocks: []};
        $.when(getTemplate(file_path + "prime_block.html"),
            getTemplate(file_path + "prime_wrapper.html")
        ).done(function (prime_block, prime_wrapper) {
            var xmarineModel = new playsModel("Xmarine"), // checkJsonData runs asynchronously
                black_parodyModel = new playsModel("Black_parody");  // checkJsonData runs asynchronousl
            $.when(
                // wait for promises to be fullfilled
                xmarineModel.promisedData,
                black_parodyModel.promisedData
            ).done(function (jsonDataXm, jsonDataBp) {
                var xmarineView = new makeReadyView(prime_block, jsonDataXm["onTheBeginning"]),
                    black_parodyView = new makeReadyView(prime_block, jsonDataBp["onTheBeginning"]),
                    ready_prime_wrapper = new makeReadyView(prime_wrapper, {
                        "Xmarine_block": xmarineView.ready_element,
                        "Black_parody_block": black_parodyView.ready_element
                    });
                $dynamicContent.html(ready_prime_wrapper.ready_element);
                setTimeout(
                    function () {
                        $dynamicContent.find('>div').eq(0).slideDown(2000);
                    },
                    900
                );
            });

        });

    },
    loadSecondary: function (urlTitle) {
        getTemplate("templates/secondary/secondary.html").then(
            // Определить, какой window[key]
            // заполнить шаблон соответствующими данными
            function (secondary) {
                var choicedPlaysModel = new playsModel(urlTitle);
                choicedPlaysModel.promisedData.then(
                    function (jsonData) {
                        var arrayImages = jsonData["onTheBeginning"]["images"].join(""),
                            data = {
                                "arrayImages": arrayImages,
                                "headerLogotip": jsonData["onTheBeginning"]["headerLogotip"],
                                "bigImage": jsonData["onTheBeginning"]["images"][0],
                                "preview": jsonData["onTheBeginning"]["preview"],
                                "playsTitle": urlTitle
                            };
                        var ready_secondary = new makeReadyView(secondary, data);
                        $dynamicContent.html(ready_secondary.ready_element);
                        if ($("#preview")[0] !== undefined) {
                            var choicedPlaysSettingColors = new settingColors(urlTitle, jsonData["otherUrlTitle"], ['preview']);
                        }
                        // xfixme: optimize -- get rid of calling:
                    }
                );
            }
        );
    },
    loadPlays: function (urlTitle) {
        console.trace('router: loadPlays');
        var file_path = "templates/entered/";
        $.when(getTemplate(file_path + "basement.html"),
            getTemplate(file_path + "about_characters.html"),
            getTemplate(file_path + "link.html")
        ).done(function (basement, about_characters, link) {
            var choicedPlaysModel = new playsModel(urlTitle);
            choicedPlaysModel.promisedData.then(
                function (jsonData) {
                    var textAboutCharacters = jsonData["About characters"], // array was passed
                        ready_about_characters = new makeReadyView(about_characters,
                            {"firstPg": '<p>' + textAboutCharacters.join('</p><p>') + '</p>'}).ready_element,
                        basementData = {
                            "headerLogotip": jsonData["onTheBeginning"]["headerLogotip"],
                            "playsTitle": jsonData["onTheBeginning"]["playsTitle"],
                            "otherUrlTitle": jsonData["otherUrlTitle"],
                            "ready_content": ready_about_characters
                        },
                        ready_basement = new makeReadyView(basement, basementData).ready_element;
                  //  console.log('%cready_basement=>', 'color:blue', ready_basement);
                    $dynamicContent.html(ready_basement);
                    fill("#parts", urlTitle, link, {"num": "", "urlTitle": urlTitle}, jsonData["Parts"]);
                    if ($("#linksSection")[0] !== undefined) {
                        var choicedPlaysSettingColors = new settingColors(urlTitle, jsonData["otherUrlTitle"], ['linksSection', 'about_characters_div']);
                    }
                }
            );
        });
    },
    loadPart: function (urlTitle, currentNumber) {
        var file_path = "templates/entered/";
        $.when(getTemplate(file_path + "basement.html"),
            getTemplate(file_path + "episode.html"),
            getTemplate(file_path + "replic.html"),
            getTemplate(file_path + "link.html")
        ).done(function (basement, episode, replic, link) {
            var choicedPlaysModel = new playsModel(urlTitle);
            choicedPlaysModel.promisedData.then(
                function (jsonData) {
                    var index = 0;
                    while (jsonData["Parts"][index]["number"] != currentNumber) {
                        index++;
                    }
                    var allocation_roles = jsonData["Parts"][index]["sharing_roles"];
                    if (typeof (allocation_roles) == "object") {
                        if (allocation_roles.length > 1) {
                            allocation_roles = "<p>" + allocation_roles.join("</p><p>") + "</p>";
                            jsonData["Parts"][index]["sharing_roles"] = allocation_roles;
                        }
                    }
                    var ready_episode = new makeReadyView(episode, jsonData["Parts"][index]).ready_element,
                        basementData = {
                            "headerLogotip": jsonData["onTheBeginning"]["headerLogotip"],
                            "playsTitle": jsonData["onTheBeginning"]["playsTitle"],
                            "otherUrlTitle": jsonData["otherUrlTitle"],
                            "ready_content": ready_episode
                        },
                        ready_basement = new makeReadyView(basement, basementData).ready_element;
                    $dynamicContent.html(ready_basement);
                    fill("#parts", urlTitle, link, {"num": "", "urlTitle": urlTitle}, jsonData["Parts"]);
                    var choicedPlaysSettingColors = new settingColors(urlTitle, jsonData["otherUrlTitle"],
                        ['linksSection', 'top_of_part', 'topText', 'buttons', 'sharing_roles', 'content_of_part']);
                    fill("#content_of_part", urlTitle, replic, {
                        "role": "",
                        "words": "",
                        "class": ""
                    }, jsonData["Parts"][index]["replics"]);
                    //var eventsClicks = new events();
                }
            )
        })
    }

});
var appRouter = new AppRouter();
Backbone.history.start();

