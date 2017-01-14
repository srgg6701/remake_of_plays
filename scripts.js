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

function defineClassNames(urlTitle){
    var otherUrlTitle;
    switch(urlTitle){
        case "Xmarine":
            otherUrlTitle="Black_parody";
            break;
        case "Black_parody":
            otherUrlTitle="Xmarine";
            break;
    }
    var choicedPlaysSettingColors = new settingColors(urlTitle, otherUrlTitle, ['preview','explain']);
    //choicedPlaysSettingColors.paintSecondary(urlTitle, otherUrlTitle, ['preview','explain']);
}
function continueFilling(container, elems){
    for(var c=1; c<elems.length; c++){
        container.append(elems[c]);
    }
}

var playsModel = Backbone.Model.extend(
    {
        defaults: {
            "ready_prime_block": ""
        },
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

var makeReadyTemplate = Backbone.View.extend(
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
        initialize: function (templ, data) {
            this.render(templ, data);
        },
        render: function (templ, data) {
            this.ready_element = _.template(templ)(data); // templ = prime_block снаружи этой функции
            // this.ready_element - готовый prime_block
            return this.ready_element;
        }
    }
);

var settingColors = Backbone.View.extend(
    {
        el: '#dynamicContent',
        // former paintSecondary:
        initialize: function(urlTitle, otherUrlTitle, secondElems) {
            $("body") // jQuery object, где HTML объект body представлен в поле с ключом 0
                ['removeClass']("backgroundFor" + otherUrlTitle)
                .addClass("backgroundFor" + urlTitle);
            for(var c= 0, l = secondElems.length; c < l; c++){
               // console.log($("#"+secondElems[c]));
            }
        },
        paintInPlays: function(urlTitle, otherUrlTitle){

        }
    }
);

var $dynamicContent = $("#dynamicContent"),
    showLoading = function () {
        $dynamicContent.html('<h2>Loading...</h2>');
    },
    defaultView = Backbone.View.extend({
        entersToSecondary: function (event) {
        },
        initialize: function () {
            showLoading();
            /*$dynamicContent.on('click', '.entersToSecondary', function(event){
             this.entersToSecondary(event);
             }.bind(this));*/
        },
        render: function (ready_prime_block_xm, ready_prime_block_p, prime_wrapper) {
            var ready_prime_wrapper = _.template(prime_wrapper)({
                Xmarine_block: ready_prime_block_xm,
                Black_parody_block: ready_prime_block_p
            });
            $dynamicContent.html(ready_prime_wrapper);
            setTimeout(
                function () {
                    $dynamicContent.find('>div').eq(0).slideDown(2000);
                },
                900
            );
        }
    }),
    default_view = new defaultView(),
    AppRouter = Backbone.Router.extend({
            routes: {
                "": "initView",
                "in_the_secondary/:urlTitle": "buildSecondary",
                "in_the_plays/:urlTitle/about_characters": "loadPlays",
                "in_the_plays/:urlTitle/part:num": "choicePart"
            },
            initView: function () {
                var file_path = "templates/primary/", prime_blocks = {prime_blocks: []};
                $.when(getTemplate(file_path + "prime_block.html"),
                    getTemplate(file_path + "prime_wrapper.html")
                ).done(function (prime_block, prime_wrapper) {
                    var xmarineModel = new playsModel("Xmarine"), // checkJsonData runs asynchronously
                        black_parodyModel = new playsModel("Black_parody");  // checkJsonData runs asynchronousl
                    $.when(
                        // getTemplatesContents извлекает данные из json-файлов для заполнения шаблонов этими данными и
                        // проверяет, что эти данные получены
                        xmarineModel.getTemplatesContents("Xmarine"),
                        black_parodyModel.getTemplatesContents("Black_parody")
                    ).done(function (jsonDataXm, jsonDataBp) {
                        // Эти экземпляры предназначены для того, чтобы заполнить каждый prime_block данными через
                        // makeReadyTemplate
                        var xmarineView = new makeReadyTemplate(prime_block, jsonDataXm["onTheBeginning"]),
                            black_parodyView = new makeReadyTemplate(prime_block, jsonDataBp["onTheBeginning"]);
                        default_view.render(xmarineView.ready_element, black_parodyView.ready_element, prime_wrapper); //для того, чтобы заполнить prime_wrapper готовыми блоками, вставить
                        // его в область динамически генерируемого контента и развернуть:
                        //default_view.render(xmarineView, black_parodyView, prime_wrapper);
                    });

                });
                // Получить оба ready_prime_block через каждый из экземпляров, сложить их в массив и внести в prime_wrapper.

            },
            buildSecondary: function (urlTitle) {
                console.log('buildSecondary, urlTitle=>', urlTitle);
                $.when(getTemplate("templates/secondary/secondary.html")).done(
                    // Определить, какой window[key]
                    // заполнить шаблон соответствующими данными
                    function (secondary) {
                        var choicedPlaysModel = new playsModel(urlTitle);
                        // определить данные
                        choicedPlaysModel.getTemplatesContents(urlTitle).then(
                            // Заполнить шаблон этими данными и вставить в область динамически генерируемого контента
                            function (jsonData) {
                                var choicedPlaysView = new makeReadyTemplate(secondary, jsonData["onTheBeginning"]);
                                var ready_secondary = choicedPlaysView.render(secondary, jsonData["onTheBeginning"]); // возвращает this.ready_element
                                $dynamicContent.html(ready_secondary);
                                var arrayImages = jsonData["onTheBeginning"]["images"];
                                for (var cnt = 0; cnt < arrayImages.length; cnt++) {
                                    $("#left").append("<img src=\"images/onTheBeginning/" + arrayImages[cnt] + ">");
                                }
                            });
                        console.log($("#preview"));
                        console.log($("#preview")[0]);
                        defineClassNames(urlTitle);
                    }
                );
            },
            loadPlays: function (urlTitle) {
                var file_path = "templates/entered/";
                $.when(getTemplate(file_path + "basement.html"),
                    getTemplate(file_path + "about_characters.html")
                ).done(function (basement, about_characters) {
                    var choicedPlaysModel = new playsModel(urlTitle);
                    choicedPlaysModel.getTemplatesContents(urlTitle).then(
                        function(jsonData) {
                            console.log(jsonData);
                            var textAboutCharacters = jsonData["About characters"];
                            var choicedPlaysView = new makeReadyTemplate(about_characters, textAboutCharacters),
                            ready_about_characters = choicedPlaysView.render(about_characters, {"ffirstPg":textAboutCharacters[0]});
                            //this.continueFilling($("#textAboutCharacters"), textAboutCharacters);
                            $dynamicContent.html(ready_about_characters);
                        }
                    );
                });
            }
        }
    );
var appRouter = new AppRouter();
Backbone.history.start();

