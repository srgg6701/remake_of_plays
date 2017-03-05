/**
 * Created by User on 26.01.2017.
 */

var resultMessages = {
        success: "<p style='color: green'>Painted!</p>",
        error: "<p style='color: firebrick'>One or both of parameters were inputed incorrectly!</p>"

    },
    $sels={
        body: $('body'),
        numbersOfReplics: $("#numbersOfReplics"),
        from_vocabulary: $('.from_vocabulary'),
        content_of_part: $('#content_of_part')
    };

$sels.body.on('mouseover', '.littleImage', function (event) {
    var pos = event.target.src.lastIndexOf("/"),
        newSrc = "images/onTheBeginning" + event.target.src.substring(pos);
    $("#bigImage").html("<img src='" + newSrc + "'>");
});

$sels.body.on('click', '.arrow', function (event) {
    var data=defineUrlTitle(this.classList);
    var urlParams = data.urlParams,
        partName = data.partName, // отрезается Part_number
        urlTitle = data.urlTitle, /**/
        currentIndex,
        newIndex;
    for (var i = 0; i < config.pages[urlTitle].length; i++) {
        if (config.pages[urlTitle][i] == partName) {
            currentIndex = i;
            break;
        }
    }
    switch (event.target.innerText) {
        case "◄":
            if (currentIndex == 0) {
                newIndex = config.pages[urlTitle].length - 1;
            } else {
                newIndex = currentIndex - 1;
            }
            break;
        case "►":
            if (currentIndex == window[urlTitle]["Parts"].length - 1) {
                newIndex = 0;
            }
            else {
                newIndex = currentIndex + 1;
            }
            break;
    }
    newPartName="Part_"+window[urlTitle]["Parts"][newIndex]["number"];
    location.href=urlParams.join("/")+"/"+newPartName;
});

$sels.body.on('click', '#showInformationButton', function (event) {
    $("#textSharingRoles").toggleClass("hidden");
    if (event.target.value == "► show the information") {
        event.target.value = "▼ hide the information";
    }
    else {
        event.target.value = "► show the information";
    }
});

$sels.body.on('click', '.showForm', function (event) {
    var clickedButton = this, id = this.getAttribute("id"), number = id[id.length - 1],
        buttonData = {
            1: {curNumber: "1", otherNumber: "2", text: "Paint by roles"},
            2: {curNumber: "2", otherNumber: "1", text: "Paint by term"},
            designedText: clickedButton.innerText
        };
    $("#form" + buttonData[number]["curNumber"]).removeClass("hidden");
    $("#form" + buttonData[number]["otherNumber"]).addClass("hidden");
    var $closeForm = $("#closeForm");
    if ($closeForm.hasClass("hidden")) {
        $closeForm.removeClass("hidden")
    }
});

$sels.body.on('click', '#closeForm', function (event) {
    event.target.classList.add("hidden");
    $("#form1").addClass("hidden");
    $("#form2").addClass("hidden");
    regularMessage($("#resultMessage"), "none", "");
});

$sels.body.on('click', '#paintWordsFromVocab', function (event) {
    var urlTitle=defineUrlTitle(this.classList).urlTitle;
    for ($sels.cnt = 0; cnt < $sels.from_vocabulary.length; cnt++) {
        $sels.from_vocabulary[cnt].classList.toggle("paintedVocabWords" + playsName);
    }
});

$sels.body.on('click', '#showInformationButton2', function (event) {
    if (event.target.value == "► show the information") {
        event.target.value = "▼ hide the information";
    }
    else {
        event.target.value = "► show the information";
    }
    var divsRoles = $("#listOfCheckboxes").find("div");
    var roles = {};
    for ($sels.cnt = 0; cnt < divsRoles.length; cnt++) {
        var keyRole = divsRoles[cnt].innerText;
        roles[keyRole] = 0;
        $sels.numbersOfReplics.append("<p>" + keyRole + "</p>");
    }
    var divsReplics = $("#content_of_part").find("div"), nameInCheck, h4 = $sels.content_of_part.find('h4');
    for (var runDivsReplics = 0; runDivsReplics < divsReplics.length; runDivsReplics++) {
        // role - из h4
        var role = h4[runDivsReplics].innerText;
        if (role.indexOf("&") == -1) {
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
                    if (role.indexOf("answer") !== -1) {
                        var posOFAmp = role.indexOf("'s");
                        nameInCheck = role.substring(0, posOFAmp);
                    } else {
                        nameInCheck = role;
                    }
            }
            roles[nameInCheck]++;
        } else {
            var conjuctedRoles = role.split(" & ");
            for (var runConjRoles = 0; runConjRoles < conjuctedRoles.length; runConjRoles++) {
                nameInCheck = conjuctedRoles[runConjRoles];
                roles[nameInCheck]++;
            }
        }


    }
    var prgs = $sels.numbersOfReplics.find("p");
    for (var cntPrgs = 0; cntPrgs < divsRoles.length; cntPrgs++) {
        var searchedRole = prgs[cntPrgs].innerText;
        prgs[cntPrgs].innerText += ": " + roles[searchedRole] + "/" + divsReplics.length;
    }

});

$sels.body.on('submit', '#form1', function (event) {
    var checkboxes = $(".checkbox"), choosenRoles = [], divsChecks = $(".div");
    for ($sels.cnt = 0; $sels.cnt < checkboxes.length; $sels.cnt++) {
        if (checkboxes[$sels.cnt].checked) {
            if (checkboxes[$sels.cnt].innerText == "Snake (Woman-devil)") {
                choosenRoles.push("Woman-devil");
            }
            else {
                choosenRoles.push(divsChecks[$sels.cnt].innerText);
            }
        }
    }
    var divsReplics = $("#content_of_part").children("div"), h4 = $sels.content_of_part.find('h4');
    var nameInCheck, nameInClass;
    /* */
    for ($sels.cnt = 0; $sels.cnt < h4.length; $sels.cnt++) {
        var role = h4[$sels.cnt].innerText;
        if (role.indexOf("&") == -1) {
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
                    if (role.indexOf("answer") !== -1) {
                        var posOFAmp = role.indexOf("'s");
                        nameInCheck = role.substring(0, posOFAmp);
                    } else {
                        nameInCheck = role;
                    }
            }
            if (choosenRoles.indexOf(nameInCheck) !== -1) { // та реплика
                // Определить имя в классе для раскраски по имени в чекбоксе
                if (nameInCheck == "Woman-devil") {
                    nameInClass = "WomanDevil";
                }
                else {
                    var partsOfName;
                    if (nameInCheck.indexOf("'s ") !== -1) {
                        partsOfName = nameInCheck.split("'s ");
                        switch (partsOfName[1]) {
                            case "grandma":
                                nameInClass = "Grandma";
                                break;
                            case "grandpa":
                                nameInClass = "Grandpa";
                                break;
                            default:
                                nameInClass = partsOfName[0];
                        }
                    } else {
                        if (nameInCheck.indexOf(" ") == -1) {
                            nameInClass = nameInCheck;
                        }
                        else {
                            partsOfName = nameInCheck.split(" ");
                            nameInClass = '';
                            for (var runParts = 0; runParts < partsOfName.length; runParts++) {
                                var firstSym = partsOfName[runParts][0].toUpperCase();
                                nameInClass += firstSym;
                                for (var runSymbs = 1; runSymbs < partsOfName[runParts].length; runSymbs++) {
                                    nameInClass += partsOfName[runParts][runSymbs];
                                }
                            }

                        }
                    }
                }
                if ((divsReplics[$sels.cnt].classList == 4) && (divsReplics[$sels.cnt].classList[3] == "paintedByTerm")) {
                    divsReplics.classList.remove("paintedByTerm");
                }
                if (!(divsReplics[$sels.cnt].classList.contains("paintedReplicsOf" + nameInClass))) {
                    divsReplics[$sels.cnt].classList.add("paintedReplicsOf" + nameInClass);
                }
            } else { // не та реплика
                if (divsReplics[$sels.cnt].classList.length == 4) {
                    delClass = divsReplics[$sels.cnt].classList[3];
                    divsReplics[$sels.cnt].classList.remove(delClass);
                }

            }
        }
        else {
            if (divsReplics[$sels.cnt].classList.contains("paintedByTerm")) {
                divsReplics[$sels.cnt].classList.remove("paintedByTerm");
            }
            var conjuctedRoles = role.split(" & "), chosenRole, counter = 0, chosenInConjuction = [];
            for (var runConj = 0; runConj < conjuctedRoles.length; runConj++) {
                if (choosenRoles.indexOf(conjuctedRoles[runConj]) !== -1) {
                    chosenRole = conjuctedRoles[runConj];
                    chosenInConjuction.push(chosenRole);
                    counter++;
                }
            }
            switch (counter) {
                case 0:
                    if (divsReplics[$sels.cnt].classList.length == 4) {
                        var delClass = divsReplics[$sels.cnt].classList[3];
                        divsReplics[$sels.cnt].classList.remove(delClass);
                    }
                    break;
                case 1:
                    regularClass(divsReplics[$sels.cnt], "paintedReplicsOf" + chosenRole);
                    break;
                default:
                    regularClass(divsReplics[$sels.cnt], "commonPaint");
            }
            var spans = h4[$sels.cnt].getElementsByTagName("span");
            if ((counter > 0) && (counter < conjuctedRoles.length)) {
                if (spans.length == 0) {
                    h4[$sels.cnt].innerText = "";
                }
                else {
                    h4[$sels.cnt].innerHTML = "";
                }
                for (var cntRoles = 0; cntRoles < conjuctedRoles.length; cntRoles++) {
                    if (chosenInConjuction.indexOf(conjuctedRoles[cntRoles]) == -1) {
                        h4[$sels.cnt].innerHTML += "<span>" + conjuctedRoles[cntRoles] + "</span>";
                    }
                    else {
                        h4[$sels.cnt].innerHTML += "<span class='highlightedOf" + conjuctedRoles[cntRoles] + "'>" + conjuctedRoles[cntRoles] + "</span>";
                    }
                    if (cntRoles < conjuctedRoles.length - 1) {
                        h4[$sels.cnt].innerHTML += "<span> & </span>";
                    }
                }
            }
            else {
                if (spans.length > 0) {
                    for (var cntSpans = 0; cntSpans < spans.length; cntSpans++) {
                        if (spans[cntSpans].classList.length == 1) {
                            var deletedClass = spans[cntSpans].classList[0];
                            spans[cntSpans].classList.remove(deletedClass);
                        }
                    }
                }
            }
        }

        if (divsReplics[$sels.cnt].classList.contains("paintedByTerm")) {
            divsReplics[$sels.cnt].classList.remove("paintedByTerm");
        }
    }
    regularMessage($("#resultMessage"), "block", resultMessages.success);
});

$sels.body.on('submit', '#form2', function (event) {
    var delClass, h4 = $sels.content_of_part.find('h4'), values = {
        firstNumber: [1, 2, 3, 4],
        periodicNumber: [2, 3, 4]
    };
    var inputedNumber1 = +($("#firstNumber").val()), inputedNumber2 = +($("#periodicNumber").val());
    if ((values.firstNumber.indexOf(inputedNumber1) !== -1) && (values.periodicNumber.indexOf(inputedNumber2) !== -1)) {
        var divsReplics = $("#content_of_part").find("div"), indexesPainting = [];
        // индекс 1-й реплики, которая должна быть раскрашена: inputedNumber1-1, счетчик из periodicNumber.
        for (var countPainter = inputedNumber1 - 1; countPainter < divsReplics.length; countPainter += inputedNumber2) {
            indexesPainting.push(countPainter);
        }
        for (var runDivs = 0; runDivs < divsReplics.length; runDivs++) {
            var ifSpansExist = h4[runDivs].getElementsByTagName("Span");
            //console.log("Spans:ifSpansExist ", ifSpansExist);
            if (ifSpansExist !== []) {
                for ($sels.cnt = 0; cnt < ifSpansExist.length; cnt++) {
                    delClass = ifSpansExist[cnt].classList[0];
                    ifSpansExist[cnt].classList.remove(delClass);
                }
            }
            if (indexesPainting.indexOf(runDivs) == -1) { // не та реплика
                if (divsReplics[runDivs].classList.length == 4) {
                    if (divsReplics[runDivs].classList[3] !== "paintedByTerm") {
                        delClass = divsReplics[runDivs].classList[3];
                        divsReplics[runDivs].classList.remove(delClass);
                    }
                }
            }
            else { // та реплика
                if (!(divsReplics[runDivs].classList.contains("paintedByTerm"))) {
                    divsReplics[runDivs].classList.add("paintedByTerm");
                }
                if (divsReplics[runDivs].classList.length == 5) {
                    delClass = divsReplics[runDivs].classList[3];
                    divsReplics[runDivs].classList.remove(delClass);
                }
            }
        }
        regularMessage($("#resultMessage"), "block", resultMessages.success);
    } else {
        regularMessage($("#resultMessage"), "block", resultMessages.error);
    }
});