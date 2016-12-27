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
            //console.log(_this.play_object);
            //defer.resolve(_this.play_object);
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


function checkReadyPrimeBlocks(xmarineModel, black_parodyModel) {
    var cnt = 0, defer = $.Deferred(), checkBlocks = setInterval(
        function () {
            cnt++;
            // проверить, что 2 prime_block, и оба заполнены данными
            if ((xmarineModel.ready_prime_block) && (black_parodyModel.ready_prime_block)) {
                if (
                    (xmarineModel.ready_prime_block != "") &&
                    (black_parodyModel.ready_prime_block != "")
                ) {
                    //console.log(xmarineModel.defaults.ready_prime_block);
                    //console.log(black_parodyModel.defaults.ready_prime_block);
                    defer.resolve("Попали.");
                    clearInterval(checkBlocks);
                }

            }

            else {
                if (cnt = 5) {
                    defer.reject("Пока не попали.");
                    clearInterval(checkBlocks);
                }
            }
        },
        60
    );
    return defer.promise();
}

function replaceImage(img, place) {
    place.html(img);
}

var config = {
    viewInit: {
        file_names: ['Black_parody', 'Xmarine']
    }
};

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
        initialize: function (key) {
        },
        getTemplatesContents: function (key) {
            var _this = this,
                defer = $.Deferred();
            getData(key);  // Получает данные из json (асинхронно) и сохраняет в window[key]
            checkJsonData(key).then( // Проверка наличия этих данных, затем -
                function (play_object) { // данная функция - это defer.resolve, вызываемая в теле checkJsonData
                    _this.set('beginData', play_object["onTheBeginning"]);
                    console.log('getTemplatesContents result, get model data: ', _this.get('beginData'));
                    defer.resolve(_this.get('beginData'));
                },
                function (mes) {
                    console.log(mes);
                }
            );
            return defer.promise();
        }
        /**
         * Эта функция каждые 100 милисекунд проверяет, имеет ли window[key] значение, отличное от
         * undefined. Если есть, то текущий экземпляр playsModel получает поле play_object с таким
         * значением, как window[key] (определенным объектом), и проверка прекращается.
         * Если cnt = 50, то проверка так же прерывается.
         */

    }
);

var makeReadyTemplate = Backbone.View.extend(
    {
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

var $dynamicContent = $("#dynamicContent"),
    showLoading = function () {
        $dynamicContent.html('<h2>Loading...</h2>');
    },
    defaultView = Backbone.View.extend({
        /*  events:{
         "click #dynamicContent": function(){
         console.log('Body clicked');
         "entersToSecondary"
         "click": function(){
         console.log('Body clicked');
         }
         },
         el: '#main',*/
        entersToSecondary: function (event) {
            console.log('entersToSecondary', event);
        },
        initialize: function () {
            //console.log('defaultView');
            showLoading();
            /*$dynamicContent.on('click', '.entersToSecondary', function(event){
             this.entersToSecondary(event);
             }.bind(this));*/
        },
        render: function (ready_prime_block_xm, ready_prime_block_p, prime_wrapper) {
            //console.log('Rendered!');
            var ready_prime_wrapper = _.template(prime_wrapper)({
                Xmarine_block: ready_prime_block_xm,
                Black_parody_block: ready_prime_block_p
            });
            // console.log('ready_prime_wrapper',ready_prime_wrapper);
            // Вложить prime_wrapper в область динамически генерируемого контента
            // увеличить высотку prime_wrapper:
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
            "enter_to_secondary/:urlTitle": "buildSecondary",
            "enter_to_plays": "enterToPlays"
        },
        initView: function () {
            var file_path = "templates/primary/", prime_blocks = {prime_blocks: []};
            $.when(getTemplate(file_path + "prime_block.html"),
                getTemplate(file_path + "prime_wrapper.html")
            ).done(function (prime_block, prime_wrapper) {
                var xmarineModel = new playsModel("Xmarine"), // checkJsonData runs asynchronously
                    black_parodyModel = new playsModel("Black_parody");  // checkJsonData runs asynchronousl
                //console.groupCollapsed('checkTemplates');
                //console.log('xmarineModel, black_parodyModel', { xmarineModel: xmarineModel, black_parodyModel: black_parodyModel });
                //console.groupEnd();
                $.when(
                    // getTemplatesContents извлекает данные из json-файлов для заполнения шаблонов этими данными и
                    // проверяет, что эти данные получены
                    xmarineModel.getTemplatesContents("Xmarine"),
                    black_parodyModel.getTemplatesContents("Black_parody")
                ).done(function (beginDataXm, beginDataBp) {
                    // Эти экземпляры предназначены для того, чтобы заполнить каждый prime_block данными через
                    // makeReadyTemplate
                    var xmarineView = new makeReadyTemplate(prime_block, beginDataXm),
                        black_parodyView = new makeReadyTemplate(prime_block, beginDataBp);
                    console.groupCollapsed('XmarineTmpl,  Black_parodyTmpl');
                    console.log({xmarineView: xmarineView, black_parodyView: black_parodyView});
                    console.groupEnd();
                    default_view.render(xmarineView.ready_element, black_parodyView.ready_element, prime_wrapper); //для того, чтобы заполнить prime_wrapper готовыми блоками, вставить
                    // его в область динамически генерируемого контента и развернуть:
                    //default_view.render(xmarineView, black_parodyView, prime_wrapper);
                });

            });
            // Получить оба ready_prime_block через каждый из экземпляров, сложить их в массив и внести в prime_wrapper.

        },
        buildSecondary: function (urlTitle) {
            console.log(urlTitle);
            $.when(getTemplate("templates/secondary/secondary.html")).done(
                // Определить, какой window[key]
                // заполнить шаблон соответствующими данными
                function (secondary) {
                    //var xmarineModel = new playsModel("Xmarine"), // checkJsonData runs asynchronously
                    // black_parodyModel = new playsModel("Black_parody");
                    // Через model определить данные для шаблона Secondary
                    var choicedPlaysModel = new playsModel(urlTitle);
                    $.when(
                        // определить данные
                        choicedPlaysModel.getTemplatesContents(urlTitle)
                    ).done(
                        // Заполнить шаблон этими данными и вставить в область динамически генерируемого контента
                        function (beginData) {
                            //console.log(secondary);
                           // console.log('beginData', beginData);
                            // Заполнить шаблон данными и загрузить через экземпляр view
                            var choicedPlaysView =  new makeReadyTemplate(secondary, beginData);
                            var ready_secondary = choicedPlaysView.render(secondary, beginData); // возвращает this.ready_element
                            $dynamicContent.html(ready_secondary);
                            $dynamicContent.on("click", "#openGateButton", function(event) {
                                this.setAttribute("disabled", "true");
                                replaceImage("<img src='images/on_the_beginning/openned_gate.jpg'>", $("#gateImage"));
                            });
                            
                        }
                    );
                    /*  *
                     * */
                    // Через view заполнить шаблон данными и вставить в dynamicContent


                }
            );
            //console.log(window["Xmarine"]);
            // console.log(window["Black_parody"]);
            // Пробег по ключам. Если нет в window, вызвать getData и checkJsonData и определить window[key].
        },
        enterToPlays: function () {

        }

        //

    });

var appRouter = new AppRouter();
Backbone.history.start();

