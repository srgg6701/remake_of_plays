/**
 * Created by User on 26.01.2017.
 */
$('body').on('click', '.arrow', function(event){
    //console.log('%cInitialized, clicked!', 'color:blue', {event:event, this:this});
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
    //console.log("arrow: ", event.target.innerText, ", new index: ", newIndex);
    urlParams[5]=config.pages[urlTitle][newIndex];
    //console.log(urlParams[5]);
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
    //console.log(event.target.classList);
    //event.target.classList;
    event.target.classList.add("hidden");
    $("#form1").addClass("hidden");
    $("#form2").addClass("hidden");
});

$('body').on('click', '#paintWordsFromVocab', function(event){
    //console.log($(".from_vocabulary"));
    var elems = location.href.split("/"), playsName = elems[4];
    //console.log("$('.from_vocabulary'): ", $('.from_vocabulary'));
   /**/ for (var cnt=0; cnt < $('.from_vocabulary').length; cnt++) {
       // console.log($('.from_vocabulary')[cnt].classList);
        $('.from_vocabulary')[cnt].classList.toggle("paintedVocabWords"+playsName);
    }
});

$('body').on('submit', '#form1', function(event){
    var checkboxes = $(".checkbox"), choosenRoles = [], divsChecks = $(".div");
    //console.log("whole array: ", checkboxes);
    for (var cnt=0; cnt < checkboxes.length; cnt++){
        //console.log("checkbox: ", checkboxes[cnt], " innerText: ", divsChecks[cnt].innerText);
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
            // 1. Определить имя в чекбоксе
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
                        nameInCheck = role.innerText.substring(0, posOFAmp);
                }
                else {
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
                            if(nameInCheck.indexOf(" ")!==-1){
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
                            else {
                                nameInClass=nameInCheck;
                            }
                        }
                        console.log("name in class: ", nameInClass);
                    }
                    divsReplics[cnt2].classList.add("paintedReplicsOf"+nameInClass)
                }
            }else {
                    if(divsReplics[cnt2].classList.length==4){
                        var deletedClass = divsReplics[cnt2].classList[3];
                        divsReplics[cnt2].classList.remove(deletedClass);
                    }

            }

            // 2. Проверить, есть ли это имя среди выбранных ролей
            // 3. Если есть, но нет раскраски: определить имя в классе раскраски и добавить класс
            // 4. Иначе: если есть раскраска, определить имя в классе и удалить класс
        }
        else {

        }
    }

});