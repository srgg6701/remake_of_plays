/**
 * Created by User on 21.01.2017.
 */
var config = {
    viewInit: {
        file_names: ['Black_parody', 'Xmarine']
    },
    pages:{
        'Black_parody':[], 'Xmarine':[]
    }
};

function getData(key, path) {
    if (!path) path = 'jsons/' + key + '.json';
    //console.trace('%cpath', 'backgroun-color: lightskyblue', {key: key, path: path});
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
            window[key] = data[key]; // определены оба объекта 'Black_parody', 'Xmarine'
            //console.log('window[key]=>', window[key]);
            // save pages
            $(window[key].Parts).each(function (index, part) { // ['Black_parody', 'Xmarine']
                //console.log('window[key].Parts=>', {index:index, parts:part});
               //console.log("index : ", index, " part: ", part);
                var partName = 'Part_'+part['number'];
                //console.log(typeof(part['number']));
                if(config.pages[key].indexOf(partName)==-1) config.pages[key].push(partName);
                //console.log("partName in functions: ", partName);
            });
            //console.log('%cconfig.pages[key]=>', 'background-color:orange', config.pages[key]);
            /*$(config.viewInit.file_names).each(function(pageName){
             $.get('jsons/'+pageName+'.json', function(numbers){
             var partName = 'Part_'+currentNumber;
             if(!pages[urlTitle]) pages[urlTitle]=[];
             if(pages[urlTitle].indexOf(partName)==-1) pages[urlTitle].push(partName);
             });
             });*/

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

function fill(selector, templ, data, arr) {
    var container = $(selector), tmpl;
    for (var c = 0, len = arr.length; c < len; c++) {
        if ("num" in data) {
            console.log("c: ", c);
            console.log("arr[c]['number']: ", arr[c]['number']);
            data["num"] = arr[c]['number'];
            //console.log("data[num]", data["num"]);
        }
        else {
            if("littleImage" in data){
                data.littleImage = arr[c];
            } else {
                data.role = Object.keys(arr[c])[0];
                // arr[c] - конкретная реплика.
                if(data.role=="image"){
                    tmpl = "<img class='col-sm-8 col-sm-offset-2' src='../images/with_characters/<%=imgName%>'>";
                    data.imgName = arr[c][data.role];
                }
                else {
                    //tmpl = templ; // replic
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
                        data.className = "characterReplic" + data.urlTitle;
                    }
                }
            }

        }
        /*if(!("num" in data)){
           console.log("data[num]", data["num"]);
        }*/
        var ready_element = new makeReadyView(templ, data).ready_element;
        container.append(ready_element);


    }
}

function regularClass(replic, neededClass){
    switch(replic.classList.length){
        case 4:
            if(replic.classList[3]!==neededClass){
                replic.classList.remove(replic.classList[3]);
                replic.classList.add(neededClass);
            }
            break;
        case 3:
            replic.classList.add(neededClass);
            break;
    }
}


function regularMessage (resultMessage, displayProperty, content){
    //console.log("display property: ", displayProperty);
    if(resultMessage.css("display")!==displayProperty){
        resultMessage.css("display", displayProperty);
    }
    if(resultMessage.html()!==content){
        resultMessage.html(content);
    }
}