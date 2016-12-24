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

function makeReadyTemplates(prime_block, beginData, _this) {
    _this.defaults.ready_prime_block = _.template(prime_block)(beginData);
    //console.log(_this.defaults.ready_prime_block ); // Здесь есть Xmarine и Black_parody
    return _this.defaults.ready_prime_block;
}

function checkReadyPrimeBlocks(xmarineModel, black_parodyModel) {
    var cnt = 0, defer = $.Deferred(), checkBlocks = setInterval(
        function () {
            cnt++;
            // проверить, что 2 prime_block, и оба заполнены данными
            if ((xmarineModel.defaults) && (black_parodyModel.defaults)) {
                if ((xmarineModel.defaults.ready_prime_block) && (black_parodyModel.defaults.ready_prime_block)) {
                    if (
                        (xmarineModel.defaults.ready_prime_block != "") &&
                        (black_parodyModel.defaults.ready_prime_block != "")
                    ) {
                        //console.log(xmarineModel.defaults.ready_prime_block);
                        //console.log(black_parodyModel.defaults.ready_prime_block);
                        defer.resolve("Попали.");
                        clearInterval(checkBlocks);
                    }

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
        initialize: function (key, prime_block) {
            //this.getTemplatesContents(key, prime_block);
        },
        getTemplatesContents: function (key, prime_block) {
            var _this = this,
                defer = $.Deferred();
            getData(key);  // Получает данные из json (асинхронно) и сохраняет в window[key]
            checkJsonData(key).then( // Проверка наличия этих данных, затем -
                function (play_object) { // из defer.resolve, что вызывается в checkJsonData.
                    var beginData = play_object["onTheBeginning"];
                    _this.defaults.ready_prime_block = makeReadyTemplates(prime_block, beginData, _this);
                    console.groupCollapsed("Внутри создания экземпляра:"); // Здесь все правильно: и Xmarine, и Black_parody
                    console.log(_this.defaults.ready_prime_block);
                    console.groupEnd();
                    defer.resolve(_this.defaults.ready_prime_block);
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


var $dynamicContent = $("#dynamicContent"),
    showLoading = function(){
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
        entersToSecondary : function(event){
            console.log('entersToSecondary', event);
        },
        initialize : function(){
            //console.log('defaultView');
            showLoading();
            /*$dynamicContent.on('click', '.entersToSecondary', function(event){
                this.entersToSecondary(event);
            }.bind(this));*/
        },
        render : function(XmarineTmpl, Black_parodyTmpl, prime_wrapper){
            //console.log('Rendered!');
            var ready_prime_wrapper = _.template(prime_wrapper)({Xmarine_block: XmarineTmpl, Black_parody_block: Black_parodyTmpl});
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
            var xmarineModel = new playsModel(), // checkJsonData runs asynchronously
                black_parodyModel = new playsModel(),  // checkJsonData runs asynchronously
                resultingHTML;
            console.groupCollapsed('checkTemplates');
            console.log( 'xmarineModel, black_parodyModel',{xmarineModel:xmarineModel,black_parodyModel:black_parodyModel});
            console.groupEnd();
            $.when(
                xmarineModel.getTemplatesContents("Xmarine", prime_block),
                black_parodyModel.getTemplatesContents("Black_parody", prime_block)
            ).done(function(XmarineTmpl, Black_parodyTmpl){
                console.groupCollapsed('XmarineTmpl,  Black_parodyTmpl');
                console.log({XmarineTmpl:XmarineTmpl, Black_parodyTmpl:Black_parodyTmpl});
                console.groupEnd();
               default_view.render(XmarineTmpl, Black_parodyTmpl, prime_wrapper);
            });
           
        });
        // Получить оба ready_prime_block через каждый из экземпляров, сложить их в массив и внести в prime_wrapper.

    },
    buildSecondary: function (urlTitle) {
        console.log(urlTitle);
        console.log("Xmarine" in window);
        console.log("Black_parody" in window);
        // Пробег по ключам. Если нет в window, вызвать getData и checkJsonData и определить window[key].
    },
    enterToPlays: function () {

    }

    //

});

var appRouter = new AppRouter();
Backbone.history.start();

