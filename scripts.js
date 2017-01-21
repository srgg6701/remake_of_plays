/**
 * Created by User on 23.11.2016.
 * Эта функция осуществляет получение данных из jsons и сохраняет их в поля key объекта window
 */

function getData(key, path) {
    if (!path) path = 'jsons/' + key + '.json';
    //console.log('%cpath', 'backgroun-color: lightskyblue', path);
    // 1. Создаём новый объект XMLHttpRequest
    var xhr = new XMLHttpRequest();
    // 2. Конфигурируем его: GET-запрос на URL 'Xmarine.json'
    xhr.open('GET', path);// путь к тому или иному json
    // 3. Отсылаем запрос
    xhr.send();
    xhr.onload = function () {
        // 4. Если код ответа сервера не 200, то это ошибка
        if (xhr.status != 200) {
            // обработать ошибку
        } else {
            var data = JSON.parse(xhr.responseText);
            window[key] = data[key]; // определены оба объекта
            return data;
        }
    };
    xhr.onerror = function (event) {
        console.log(event);
    };
}
/**
 * @param file_dir      String
 * @param template_name String
 * @return promise
 * Эта функция получает шаблон, определяет его внутреннее содержимое
 */

function getTemplate(fileWay) {
    var defer = $.Deferred();
    // ... 
    $.get(fileWay, function (template_file) { // все содержимое файла по данному запросу в одну строку
        // преобразует строку в html-элемент
        var tmplHTML = $.parseHTML(template_file), // все содержимое тегов script в файле
            tmplContents = $(tmplHTML).html();
        defer.resolve(tmplContents);
    });
    return defer.promise();
}

function checkJsonData(key) {
    // setTimeout start
    var defer = $.Deferred(),
        cnt = 0;
    // вызывается многократно
    var sttm = setInterval(function () {
        ++cnt;
        if (window[key]) {
            // this передан через .bind
            this.play_object = window[key]; // (xmarineModel | black_parodyModel).play_object
            defer.resolve(this.play_object);
            clearInterval(sttm);
        }
        if (cnt >= 50) {
            console.warn('Cannot get file');
            defer.reject("The content is not here yet.");
            clearInterval(sttm);
        }
    }.bind(this), 100);
    return defer.promise();
}

var config = {
    viewInit: {
        file_names: ['Black_parody', 'Xmarine']
    }
};

function pasteLinks(container, urlTitle, templ, data, arr){
    for(var c=0; c<arr.length; c++){
        data.num = arr[c]["number"];
        var readyLink = new makeReadyView(templ, data).ready_element;
        container.append(readyLink);
    }
}

function pasteReplics(){

}

function fill(selector, urlTitle, templ, data, arr) {
    var container = $(selector);
    for (var c = 0, len = arr.length; c < len; c++) {
        if("num" in data){
            data.num = arr[c]['number'];
        }
        else {
            data.role = Object.keys(arr[c])[0];
            // arr[c] - конкретная реплика.
            if (typeof(arr[c][data.role]) == "object") {
                if (arr[c][data.role].length > 1) {
                    data.words = "<p>" + arr[c][data.role].join("</p><p>") + "</p>";
                }
                else {
                    data.words = arr[c][data.role][0];
                }
            }
            else {
                data.words = arr[c][data.role];
            }
            if (data.role == "Author's words") {
                data.className = "authorReplic";
            }
            else {
                data.className = "characterReplic" + urlTitle;
            }
            console.log("arr[c]", arr[c]);
            console.log("words", data.words);
        }

        var ready_element = new makeReadyView(templ, data).ready_element;
        container.append(ready_element);
    }

}

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
            checkJsonData(key).then( // Проверка наличия этих данных, затем -
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

var makeReadyView = Backbone.View.extend(
    {
        events: {
            //В event входит иерархия элементов от явно указанного (dynamicContent) до самого вложенного
            // в кликнутый элемент.
            'click .choicePlay': function (event) {
                var newUrlTitle;
                switch (event.target.innerText) {
                    case "X-marine":
                        urlTitle = "Xmarine";
                        break;
                    case "Black parody":
                        urlTitle = "Black_parody";
                        break;
                }
                location.href = "#in_the_secondary/" + urlTitle;
            }
        },
        el: '#dynamicContent',
        ready_element: '', // should be an Array after render
        /**
         * @param templ -- HTML template
         * @param data -- Array
         * @returns {*}
         */
        initialize: function (templ, data) {
            //console.trace('makeReadyView.initialize, arguments=>', {templ:templ, data:data});
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
  var  AppRouter = Backbone.Router.extend({
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
                        $dynamicContent.html(ready_basement);
                        fill("#parts", urlTitle, link, {"num": "", "urlTitle": urlTitle}, jsonData["Parts"]);
                        if ($("#linksSection")[0] !== undefined) {
                            var choicedPlaysSettingColors = new settingColors(urlTitle, jsonData["otherUrlTitle"], ['linksSection', 'about_characters_div']);
                        }
                    }
                );
            });
        },
        loadPart: function(urlTitle, currentNumber){
            console.log("Функция вызвана");
            var file_path = "templates/entered/";
            $.when(getTemplate(file_path + "basement.html"),
                getTemplate(file_path + "episode.html"),
                getTemplate(file_path + "replic.html"),
                getTemplate(file_path + "link.html")
            ).done(function (basement, episode, replic, link) {
                var choicedPlaysModel = new playsModel(urlTitle);
                choicedPlaysModel.promisedData.then(
                    function (jsonData) {
                        var index=0;
                        while (jsonData["Parts"][index]["number"] != currentNumber) {
                            index++;
                        }
                        var allocation_roles = jsonData["Parts"][index]["sharing_roles"];
                        if(typeof (allocation_roles)=="object"){
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
                        fill("#content_of_part", urlTitle, replic, {"role": "", "words": "", "class": ""}, jsonData["Parts"][index]["replics"]);
                    }
                )
            })
        }

  });
var appRouter = new AppRouter();
Backbone.history.start();

