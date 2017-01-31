/**
 * Created by User on 26.01.2017.
 */

var resultMessages = {
    success: "<p style='color: green'>Painted!</p>",
    error: "<p style='color: firebrick'>One or both of parameters were inputed incorrectly!</p>"

};

$('body').on('mouseover', '.littleImage', function(event){
    var pos = event.target.src.indexOf("/images"),
        newSrc = event.target.src.substring(pos);
    $("#bigImage").html("<img src='"+newSrc+"'>");
});

$('body').on('click', '.arrow', function(event){
    var newNumber, urlParams = location.href.split('/'), urlTitle = urlParams[4],
        partName = urlParams[5], currentIndex, newIndex;
    for(var i=0; i < config.pages[urlTitle].length; i++){
        if(config.pages[urlTitle][i]==partName){
            currentIndex=i;
            break;
        }
    }
    switch(event.target.innerText){
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
    urlParams[5]=config.pages[urlTitle][newIndex];
    location.href="#in_the_plays/"+urlTitle+"/"+config.pages[urlTitle][newIndex];

});

$('body').on('click', '#showInformationButton', function(event){
    $("#textSharingRoles").toggleClass("hidden");
    if(event.target.value=="► show the information"){
        event.target.value="▼ hide the information";
    }
    else {
        event.target.value="► show the information";
    }
});

$('body').on('click', '.showForm', function(event){
    var clickedButton = this, id = this.getAttribute("id"), number = id[id.length-1],
        buttonData = {
            1: {curNumber: "1", otherNumber: "2", text: "Paint by roles"},
            2: {curNumber: "2", otherNumber: "1", text: "Paint by term"},
            designedText: clickedButton.innerText
        };
    $("#form"+buttonData[number]["curNumber"]).removeClass("hidden");
    $("#form"+buttonData[number]["otherNumber"]).addClass("hidden");
    if($("#closeForm").hasClass("hidden")){
        $("#closeForm").removeClass("hidden")
    }
});

$('body').on('click', '#closeForm', function(event){
    event.target.classList.add("hidden");
    $("#form1").addClass("hidden");
    $("#form2").addClass("hidden");
    regularMessage($("#resultMessage"), "none", "");
});

$('body').on('click', '#paintWordsFromVocab', function(event){
    var elems = location.href.split("/"), playsName = elems[4];
    for (var cnt=0; cnt < $('.from_vocabulary').length; cnt++) {
        $('.from_vocabulary')[cnt].classList.toggle("paintedVocabWords"+playsName);
    }
});

$('body').on('submit', '#form1', function(event){
    var checkboxes = $(".checkbox"), choosenRoles = [], divsChecks = $(".div");
    for (var cnt=0; cnt < checkboxes.length; cnt++){
        if(checkboxes[cnt].checked) {
            if(checkboxes[cnt].innerText=="Snake (Woman-devil)"){
                choosenRoles.push("Woman-devil");
            }
            else {
                choosenRoles.push(divsChecks[cnt].innerText);
            }
        }
    }
    var divsReplics = $("#content_of_part").children("div"), h4 = $('#content_of_part').find('h4');
    var nameInCheck, nameInClass; /* */
    for(var cnt2=0; cnt2 < h4.length; cnt2++){
        var role = h4[cnt2].innerText;
        if(role.indexOf("&")==-1){
            switch (role){
                case "Being":
                nameInCheck="Beatrix";
                break;
                case "Monster":
                nameInCheck="Helen";
                break;
                case "Monster 2":
                nameInCheck="Judy";
                break;
                default:
                if(role.indexOf("answer")!==-1){
                        var posOFAmp = role.indexOf("'s");
                        nameInCheck = role.substring(0, posOFAmp);
                } else {
                        nameInCheck=role;
                }
            }
            if(choosenRoles.indexOf(nameInCheck)!==-1){
                if(divsReplics[cnt2].classList.length=3){
                    // Определить имя в классе для раскраски по имени в чекбоксе и добавить этот класс в div.
                    if(nameInCheck=="Woman-devil"){
                        nameInClass="WomanDevil";
                    }
                    else {
                        var partsOfName;
                        if(nameInCheck.indexOf("'s ")!==-1) {
                            partsOfName=nameInCheck.split("'s ");
                            switch(partsOfName[1]){
                                case "grandma":
                                    nameInClass="Grandma";
                                    break;
                                case "grandpa":
                                    nameInClass="Grandpa";
                                    break;
                                default:
                                    nameInClass=partsOfName[0];
                            }
                        }else{
                            if(nameInCheck.indexOf(" ")==-1){
                                nameInClass=nameInCheck;
                            }
                            else {
                                if(nameInCheck=="Fake Jessie"){
                                    nameInClass="WomanDevil";
                                }
                                partsOfName=nameInCheck.split(" ");
                                nameInClass='';
                                for (var runParts=0; runParts < partsOfName.length; runParts++){
                                    var firstSym =  partsOfName[runParts][0].toUpperCase();
                                    nameInClass+=firstSym;
                                    for (var runSymbs=1; runSymbs < partsOfName[runParts].length; runSymbs++){
                                        nameInClass+=partsOfName[runParts][runSymbs];
                                    }
                                }

                            }
                        }
                    }
                    divsReplics[cnt2].classList.add("paintedReplicsOf"+nameInClass)
                }
            }else {
                    if(divsReplics[cnt2].classList.length==4){
                        var deletedClass = divsReplics[cnt2].classList[3];
                        divsReplics[cnt2].classList.remove(deletedClass);
                    }

            }
        }
        else {
            /**
             * 1. Разбить строку на роли;
             * 2. В цикле каждую роль проверить на присуствие в массиве выбранных ролей
             * В случае присутствия: увеличить счетчик, сохранить в переменную роль
             * После цикла по значению счетчика и переменной, содержащей в себе роль, определить раскраску.
             * Если этого класса у реплики нет:
             *  Если есть другой 4-й класс, удалить этот класс;
             *  В любом случае: добавить нужный класс.
             */
            var conjuctedRoles = role.split(" & "), chosenRole, counter= 0, chosenInConjuction = [];
            for(var runConj=0; runConj<conjuctedRoles.length; runConj++){
                if(choosenRoles.indexOf(conjuctedRoles[runConj])!==-1){
                    chosenRole=conjuctedRoles[runConj];
                    chosenInConjuction.push(chosenRole);
                    counter++;
                }
            }
            switch(counter){
                case 0:
                    if(divsReplics[cnt2].classList.length==4){
                        var delClass = divsReplics[cnt2].classList[3];
                        divsReplics[cnt2].classList.remove(delClass);
                    }
                    break;
                 case 1:
                    regularClass(divsReplics[cnt2], "paintedReplicsOf"+chosenRole);
                    break;
                default:
                    regularClass(divsReplics[cnt2], "commonPaint");
            }
            var spans = h4[cnt2].getElementsByTagName("span");
            //console.log("spans: ", spans);
            /* Если counter не равен 0 или длине массива - что-то должно быть раскрашено.
                * Если длина нулевая, тегов span нет в h4, ничего в заголовке не раскрашено. Очистить innerText/
                * Иначе: очистить innerHTML.
                * В любом случае: вставить теги с ролями и классы в теги с нужными ролями.
            *  Если counter равен 0 или длине массива, ничего не должно быть раскрашено.
                * Если есть теги span, пробег по ним, если есть класс, то он удаляется.
            * */
            if((counter>0)&&(counter<conjuctedRoles.length)){
                if(spans.length==0){
                    h4[cnt2].innerText="";
                }
                else {
                    h4[cnt2].innerHTML="";
                }
                for (var cntRoles=0; cntRoles<conjuctedRoles.length; cntRoles++){
                    if(chosenInConjuction.indexOf(conjuctedRoles[cntRoles])==-1){
                        h4[cnt2].innerHTML+="<span>"+conjuctedRoles[cntRoles]+"</span>";
                    }
                    else {
                        h4[cnt2].innerHTML+="<span class='highlightedOf"+conjuctedRoles[cntRoles]+"'>"+conjuctedRoles[cntRoles]+"</span>";
                    }
                    if(cntRoles<conjuctedRoles.length-1){
                        h4[cnt2].innerHTML+="<span> & </span>";
                    }
                }
            }
            else {
                if(spans.length>0){
                    for(var cntSpans=0; cntSpans < spans.length; cntSpans++){
                        if(spans[cntSpans].classList.length==1){
                            var deletedClass=spans[cntSpans].classList[0];
                            spans[cntSpans].classList.remove(deletedClass);
                        }
                    }
                }
            }
        }

    }
    regularMessage($("#resultMessage"), "block", resultMessages.success);
});

$('body').on('submit', '#form2', function(event){
    var values = {
        firstNumber: [1, 2, 3, 4],
        periodicNumber: [2, 3, 4]
    };
    var inputedNumber1=+($("#firstNumber").val()), inputedNumber2=+($("#periodicNumber").val());
    if((values.firstNumber.indexOf(inputedNumber1)!==-1)&&(values.periodicNumber.indexOf(inputedNumber2)!==-1)){
        var divsReplics = $("#content_of_part").find("div"), indexesPainting=[];
        // индекс 1-й реплики, которая должна быть раскрашена: inputedNumber1-1, счетчик из periodicNumber.
        for (var countPainter=inputedNumber1-1; countPainter<divsReplics.length; countPainter+=inputedNumber2) {
            indexesPainting.push(countPainter);
        }
        for (var runDivs=0; runDivs<divsReplics.length; runDivs++){
            if(indexesPainting.indexOf(runDivs)==-1){
                if(divsReplics[runDivs].classList.length==4){
                    if(divsReplics[runDivs].classList[4]!=="paintedByTerm"){
                        var delClass=divsReplics[runDivs].classList[4];
                        divsReplics[runDivs].classList.remove("paintedByTerm");
                    }
                }
            }
            else {
                if(!(divsReplics[runDivs].classList.contains("paintedByTerm"))){
                    divsReplics[runDivs].classList.add("paintedByTerm");
                }
                if(divsReplics[runDivs].classList.length==5){
                    var delClass=divsReplics[runDivs].classList[3];
                    divsReplics[runDivs].classList.remove(delClass);
                }
            }
        }
        regularMessage($("#resultMessage"), "block", resultMessages.success);
    }else {
        regularMessage($("#resultMessage"), "block", resultMessages.error);
    }
});