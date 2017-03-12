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
            this.render(templ, data);
        },
        render: function (templ, data) {
            //console.log(templ);
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
        ).done(function (prime_block, prime_wrapper) { console.log('done=>',{prime_block:prime_block, prime_wrapper:prime_wrapper});
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
                                "headerLogotip": jsonData["onTheBeginning"]["headerLogotip"],
                                "bigImage": jsonData["onTheBeginning"]["images"][0],
                                "preview": jsonData["onTheBeginning"]["preview"],
                                "playsTitle": urlTitle
                            };
                        data["bigImage"]="<img src='images/onTheBeginning/"+data["bigImage"]+"'>";
                        var ready_secondary = new makeReadyView(secondary, data);
                        $dynamicContent.html(ready_secondary.ready_element);
                        var templ="<img class='col-md-10 col-md-offset-1 littleImage' src='images/onTheBeginning/<%=littleImage%>'>";
                        fill("#left", templ, {"littleImage": ""}, jsonData["onTheBeginning"]["images"]);
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
                    $dynamicContent.html(ready_basement);
                    fill("#parts", link, {"num": "", "urlTitle": urlTitle}, jsonData["Parts"]);
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
                    var sharing_roles = jsonData["Parts"][index]["sharing_roles"];
                    if (typeof (sharing_roles) == "object") {
                        if (sharing_roles.length > 1) {
                            sharing_roles = "<p>" + sharing_roles.join("</p><p>") + "</p>";
                            jsonData["Parts"][index]["sharing_roles"] = sharing_roles;
                        }
                    }
                    var roles = [];
                    for (var runRoles=0; numbReps = jsonData["Parts"][index]["replics"].length, runRoles < numbReps; runRoles++){
                        var role = Object.keys(jsonData["Parts"][index]["replics"][runRoles])[0];
                        if((role.indexOf("&")==-1)&&(role!=="image")){
                           var nameInCheck;
                            switch (role) {
                                case "Being":
                                    nameInCheck = "X-marine";
                                    break;
                                case "Monster":
                                    nameInCheck = "Helen";
                                    break;
                                case "Monster 2":
                                    nameInCheck = "Judy";
                                    break;
                                default:
                                    if (role.indexOf("'s ") == -1) {
                                        nameInCheck = role;
                                    } else {
                                        var els=role.split("'s ");
                                        if((els[0]=="Helen")||(els[0]=="Ramon")||(els[0]=="Nick")){
                                            nameInCheck=els[0]
                                        }
                                        else {
                                            nameInCheck=role;
                                        }
                                        //console.log("els: ", els);
                                    }
                            }
                            if(roles.indexOf(nameInCheck)==-1){
                                roles.push(nameInCheck);
                            }

                        }
                        //console.log("roles: ", roles);
                        /*if((role!=="Being")&&(role!=="image")&&(role.indexOf("thoughts")==-1)&&
                        (role.indexOf("Monster")==-1)&&(role.indexOf("&")==-1)
                        &&(role.indexOf("answer")==-1)){
                            if(role=="Snake"){
                                role=role+" (Woman-devil)";
                            }
                            if(roles.indexOf(role)==-1){
                                roles.push(role);
                            }
                        } */

                    } // rolesListHTML
                    jsonData["Parts"][index]["rolesList"]="<div class='div'><input class='checkbox' type='checkbox'>"
                        +roles.join("</div><div class='div'><input class='checkbox' type='checkbox'>")+("</div>");
                    var ready_episode = new makeReadyView(episode, jsonData["Parts"][index]).ready_element,
                        basementData = {
                            "headerLogotip": jsonData["onTheBeginning"]["headerLogotip"],
                            "playsTitle": jsonData["onTheBeginning"]["playsTitle"],
                            "otherUrlTitle": jsonData["otherUrlTitle"],
                            "ready_content": ready_episode
                        },
                        ready_basement = new makeReadyView(basement, basementData).ready_element;
                    $dynamicContent.html(ready_basement);
                    fill("#parts", link, {"num": "", "urlTitle": urlTitle}, jsonData["Parts"]);
                    var choicedPlaysSettingColors = new settingColors(urlTitle, jsonData["otherUrlTitle"], ['linksSection',
                        'topText', 'buttons', 'sharing_roles', 'chooseReplics', 'content_of_part', 'resultMessage']);
                    var data={"role": "", "words": "", "className": "", "urlTitle": urlTitle, "image": ""},
                        image="<img class='col-sm-8 col-sm-offset-2' src='images/with_characters/<%=image%>'>";
                    fill("#content_of_part", [replic, image], data, jsonData["Parts"][index]["replics"]);

                }

            )
        })
    }

});
var appRouter = new AppRouter();
Backbone.history.start();

