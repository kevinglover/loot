var dieRoll, transDelay = 500,
    gold, cost, item;

$(document).ready(function() {
    if(document.location.search.length) {
        relicObj = $.deparam.querystring();
        document.title = relicObj.name + " [" + document.title + "]";
        $('#loot-output').append('<article id="treasure-1"/>');
        createItemCards(1);
    } 

    $('#generate').click(function() {
        generate();
    });

    $(document).keypress(function(key) {
        //Enter key generates new results
        if (key.which === 13 || key.which === 32) {
            key.preventDefault();
            generate();
        }
    });

    //Show/Hide About and Settings
    $('#settingsButton').click(function() {
        var display = ($('#settings-wrapper').css('display') === 'none') ? 'show' : 'hide';
        show_hide_panel(display, '#settings-wrapper');
    });

    $('#aboutButton').click(function() {
        var display = ($('#about-wrapper').css('display') === 'none') ? 'show' : 'hide';
        show_hide_panel(display, '#about-wrapper');
    });

    function show_hide_panel(display, id) {
        if (display === 'show') {
            $('#right-panel').addClass('display', function(){
                set_display(id, display);
            });
        } else if (display === 'hide') {
            $('#right-panel').removeClass('display', function(){
                set_display(id, display);
            });
        }
    }


    $(function() {
        $("#about-accordion").accordion({
                collapsible: true,
                heightStyle: "content",
                active: false
            });
    });

    $('#rating').change(function() {
        //Toggle the custom treasure input fields based on the selected option
        var rating = $(this).val();
        if (rating === 'custom') {
            $('#customTreasureRating').show(transDelay);
        } else {
            $('#customTreasureRating').hide(transDelay);
        }
    });

    //Adjust blackpowder state based on whether ranged weapons are selected

    $('#ranged_weapon').change(function() {
        if ($(this).prop('checked') === true) {
            //allow blackpowder to be selected
            $('#blackpowder').prop('disabled', false);
        } else {
            //disable blackpowder and remove checked state
            $('#blackpowder').prop('disabled', true);
            $('#blackpowder').prop('checked', false);
        }
    });

    $('#selectAll').click(function() {
        $('#blackpowder').prop('disabled', false);
        $('#chooseTypes').find(':checkbox').add($('#adjustments').find(':checkbox')).prop('checked', true);
    });

    $('#clearAll').click(function() {
        $('#blackpowder').prop('disabled', true);
        $('#chooseTypes').find(':checkbox').add($('#adjustments').find(':checkbox')).prop('checked', false);
    });

});

function addCommas(nStr) {
	nStr += '';
	var x = nStr.split('.');
	var x1 = x[0];
	var x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while(rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}

function set_display(id, display) {
    switch (id) {
        case '#settings-wrapper':
            switch (display) {
                case 'show':
                    //hide About
                    set_display('#about-wrapper', 'hide');
                    //Display Settings
                    $('#settings-wrapper').show();
                    break;
                case 'hide':
                    $('#settings-wrapper').hide();
                    break;
            }
            break;
        case '#about-wrapper':
            //toggle the content display
            switch (display) {
                case 'show':
                    set_display('#settings-wrapper', 'hide');
                    $('#about-wrapper').show();
                    break;
                case 'hide':
                    $('#about-wrapper').hide();
                    break;
            }
            break;
    }
}

function d(dieSize) {
    dieRoll = Math.round(Math.random() * dieSize) % dieSize + 1;
    return dieRoll;
}

function generate() {
    //Get and set the Treasure Rating

    $('#loot-output').children().remove();

    var lootMultiplier = $('#lootMultiplier').val(), chosenRating = $('#rating').val(),
        customGoldMultiplier = d($('#customGoldMultiplier').val()),
        customGoldAmount = $('#customGoldAmount').val(),
        customMagicItemChance = $('#customMagicItemChance').val(), magicItemChanceRoll,
        i = 0, result, totalGold = 0, ratingObj = {
            meager: {
                gold: function(){
                    return d(10) * 10;
                },
                magicItemChance: 10
            },
            worthwhile: {
                gold: function(){
                    return d(10) * 100;
                },
                magicItemChance: 25
            },
            rich: {
                gold: function(){
                    return d(10) * 500;
                },
                magicItemChance: 50
            },
            treasure_trove: {
                gold: function(){
                    return d(10) * 1000;
                },
                magicItemChance: 100
            },
            custom: {
                gold: function(){
                    return customGoldMultiplier * customGoldAmount;
                },
                magicItemChance: customMagicItemChance
            }
        };
        
    lootObj = {};

    while (++i <= lootMultiplier) {
        for (treasureRating in ratingObj) {
            if (chosenRating === treasureRating) {
                result = ratingObj[treasureRating];
                gold = result.gold();
                //Create a numbered treasure container for gold and potential item
                $('#loot-output').append('<article id="treasure-' + i +'"/>');
                $('#treasure-' + i).append('<h2 class="no-print">Treasure #'+i+'</h2>');
                $('#treasure-' + i).append('<p id="gold-' + i + '" class="gold no-print"><strong>Gold:</strong> $' + addCommas(gold) + '</p>');

                //Roll for chance of magic item.
                magicItemChanceRoll = d(100);
                if (magicItemChanceRoll <= result.magicItemChance) {
                    //set relicObj
                    relicObj = {
                        cost: 0
                    };
                    magicItemGenOutput(i);
                }
                break;
            }
        }
        totalGold += gold;
  }
  //Total the amount of gold generated if there is more than one roll
  if (lootMultiplier > 1) {
		$('#loot-output').prepend('<p id="total-gold" class="no-print"><strong>Total Gold:</strong> $' + addCommas(totalGold) + '</p>');
  }
  
  $('html, body').animate({
        scrollTop: $('#generate').offset().top
  }, 500);
}

function magicItemGenOutput(numItem) {

    //set chosenTypesObj
    chosenTypesObj = {};
    var type;
    $.each($('#chooseTypes').find('input[type="checkbox"]:checked').add('#adjusted:checked').add('#intelligent:checked'), function() {
        if ($(this).prop('checked')) {
            type = $(this).attr('id');
            chosenTypesObj[type] = true;
        }
    });
    //console.log(JSON.stringify(chosenTypesObj));

    if ($('#chooseTypes').find('input[type="checkbox"]:checked').length === 0) {
        $('#no-type-warning').remove();
        $('#settings-wrapper').prepend('<p id="no-type-warning">Please select at least one type of item</p>');
        $('#right-panel').addClass('display');
        set_display('#settings-wrapper', 'show');
    } else {
        $('#no-type-warning').remove();

        magicItemType();

        //console.dir(relicObj);

        //remove item-cards
        //$('.item-card').remove();
        
        createItemCards(numItem);

    }
}

//Create item cards
function createItemCards(numItem){
        console.log(JSON.stringify(relicObj));
        /*lootObj[numItem] = relicObj;
        console.log(JSON.stringify(lootObj));*/

        $('#treasure-' + numItem).append('<section id="item-card-' + numItem + '" class="item-card"/>');

        //Build elements, step through relicObj values, append to DOM
        $('#item-card-' + numItem).append('<h3 class="item-name">' + relicObj.name + '</h3>');

        if (relicObj.size) {
            $('#item-card-' + numItem + ' .item-name').prepend(relicObj.size + ' ');
        }

        if (relicObj.page) {
            $('#item-card-' + numItem).append('<p class="page-reference">p.' + relicObj.page + '</p>');
        }

        $('#item-card-' + numItem).append('<ul class="properties" />');

        if (relicObj.rangeMultiplier > 1) {
            $('#item-card-' + numItem + ' .properties').append('<li><strong>Increased Range:</strong> ' + relicObj.range + '</li>');
        }

        if (relicObj.bonus) {
            $('#item-card-' + numItem + ' .properties').append('<li class="bonus"><strong>Bonus:</strong> ' + relicObj.bonus + '</li>');
        }

        if (relicObj["skill bonuses"]) {
            var skill, skillbonus, skillBonusesArray = [],
                skillBonuses;
            $('#item-card-' + numItem + ' .properties').append('<li class="skill-bonuses"><strong>Skill Bonuses:</strong> </li>');
            for (skill in relicObj["skill bonuses"]) {
                skillBonus = relicObj["skill bonuses"][skill];
                skillBonusesArray.push(skill + ' +' + skillBonus);
            }
            skillBonusesArray = skillBonusesArray.sort();
            skillBonuses = skillBonusesArray.join(', ');
            $('#item-card-' + numItem + ' .skill-bonuses').append(skillBonuses);
        }

        if (relicObj.Edges) {
            var edge, edgesArray = [],
                edges;
            $('#item-card-' + numItem + ' .properties').append('<li class="edges"><strong>Edges:</strong> </li>');
            for (edge in relicObj.Edges) {
                edgesArray.push(edge);
            }
            edgesArray = edgesArray.sort();
            edges = edgesArray.join(', ');
            $('#item-card-' + numItem + ' .edges').append(edges);
        }

        if (relicObj.powers) {
            var power, effect, powersArray = [],
                powers;
            if (relicObj.powers["Minor Artifact"]) {
                powersArray = [];
                $('#item-card-' + numItem + ' .properties').append('<li class="minor-artifact"><strong>Minor Artifact:</strong> </li>');
                for (power in relicObj.powers["Minor Artifact"]) {
                    powersArray.push('<em>' + power + '</em>');
                }
                powersArray = powersArray.sort();
                powers = powersArray.join(', ');
                $('#item-card-' + numItem + ' .minor-artifact').append(powers);
            }

            if (relicObj.powers["Major Artifact"]) {
                powersArray = [];
                $('#item-card-' + numItem + ' .properties').append('<li class="major-artifact"><strong>Major Artifact:</strong> </li>');
                for (power in relicObj.powers["Major Artifact"]) {
                    effect = relicObj.powers["Major Artifact"][power];
                    if (effect === 'standard') {
                        powersArray.push('<em>' + power + '</em>');
                    } else {
                        powersArray.push('<em>' + power + '</em>' + ' [' + effect + ']');
                    }
                }
                powersArray = powersArray.sort();
                powers = powersArray.join(', ');
                $('#item-card-' + numItem + ' .major-artifact').append(powers);
            }
            if (relicObj.powers["Major Artifact with raise"]) {
                powersArray = [];
                $('#item-card-' + numItem + ' .properties').append('<li class="major-artifact-with-raise"><strong>Major Artifact with a raise:</strong> </li>');
                for (power in relicObj.powers["Major Artifact with raise"]) {
                    effect = relicObj.powers["Major Artifact with raise"][power];
                    if (effect === 'standard') {
                        powersArray.push('<em>' + power + '</em>');
                    } else {
                        powersArray.push('<em>' + power + '</em>' + ' [' + effect + ']');
                    }
                }
                powersArray = powersArray.sort();
                powers = powersArray.join(', ');
                $('#item-card-' + numItem + ' .major-artifact-with-raise').append(powers);
            }
        }

        if (relicObj.potion) {
            $('#item-card-' + numItem + ' .properties').append('<li class="power"><strong>Power:</strong> <em>' + relicObj.potion.power + '</em></li>');
            if (relicObj.potion.withRaise === true) {
                $('#item-card-' + numItem + ' .properties li.power').append(' with raise');
            }
            if (relicObj.potion.effect !== undefined) {
                $('#item-card-' + numItem + ' .properties li.power').append(' [' + relicObj.potion.effect + ']');
            }
        }

        if (relicObj.scroll) {
            $('#item-card-' + numItem + ' .properties').append('<li class="power"><strong>Power:</strong> <em>' + relicObj.scroll.power + '</em></li>');
            $('#item-card-' + numItem + ' .properties').append('<li><strong>Power Points:</strong> ' + relicObj.scroll.pp);
            $('#item-card-' + numItem + ' .properties').append('<li><strong>Arcane Type:</strong> ' + relicObj.scroll.arcaneType + '</li>');
        }

        if (relicObj.tome) {
            $('#item-card-' + numItem + ' .properties').append('<li class="power"><strong>Power:</strong> <em>' + relicObj.tome.power + '</em></li>');
            $('#item-card-' + numItem + ' .properties').append('<li><strong>Arcane Type:</strong> ' + relicObj.tome.arcaneType + '</li>');
        }

        if (relicObj.intelligent) {
            $('#item-card-' + numItem).append('<h4><strong>Intelligent Relic</strong></h4>');
            $('#item-card-' + numItem).append('<ul class="intelligent-properties" />');

            var relicSkill, skillDie, skillsArray = [],
                personality, personalityArray = [],
                goal, goalsArray = [];

            //output Attributes
            $('#item-card-' + numItem + ' .intelligent-properties').append('<li class="attributes"><strong>Attributes:</strong> Smarts ' + relicObj.intelligent.attributes.Smarts + ', Spirit ' + relicObj.intelligent.attributes.Spirit + ' </li>');

            //output Skills
            $('#item-card-' + numItem + ' .intelligent-properties').append('<li class="skills"><strong>Skills:</strong> </li>');
            for (relicSkill in relicObj.intelligent.skills) {
                skillDie = relicObj.intelligent.skills[relicSkill];
                skillsArray.push(relicSkill + ' ' + skillDie);
            }
            skillsArray = skillsArray.sort();
            skills = skillsArray.join(', ');
            $('#item-card-' + numItem + ' .skills').append(skills);

            //output personality
            $('#item-card-' + numItem + ' .intelligent-properties').append('<li class="personality"><strong>Personality:</strong> </li>');
            for (personality in relicObj.intelligent.personality) {
                personalityArray.push(personality);
            }
            $('#item-card-' + numItem + ' .personality').append(personalityArray.join(', '));

            //output goals
            $('#item-card-' + numItem + ' .intelligent-properties').append('<li class="goals"><strong>Goals:</strong> </li>');
            for (goal in relicObj.intelligent.goals) {
                goalsArray.push(goal);
            }
            $('#item-card-' + numItem + ' .goals').append(goalsArray.join(', '));
        }

        if (relicObj.relicType === "Wand" || relicObj.relicType === "Staff"){
            $('#item-card-' + numItem + ' .item-name').prepend(relicObj.relicType + ': ');
        }

        var cost;

        switch (isNaN(relicObj.cost * 1)){
            case true:
                cost = relicObj.cost;
                break;
            case false:
                cost = '$' + addCommas(relicObj.cost);
                break;
        }
        $('#item-card-' + numItem).append('<footer><p class="cost"><strong>Cost:</strong> ' + cost + '</p></footer>');
        //console.log($.param(relicObj));

        var item_url = window.location.origin + window.location.pathname + '?' + $.param(relicObj);
        //console.log(item_url);

        $('#item-card-' + numItem).prepend('<p id="buttons-' + numItem + '" class="treasure-buttons no-print"><a href="' + item_url + '" target="_blank_" title="Link to this item" ><span class="icon-link"></span></a></p>');
        //Google Cloud Print Button Begin
        $('#item-card-' + numItem).children('#buttons-' + numItem).append('<span id="print-treasure-' + numItem + '" class="icon-print" title="Print card via Google Cloud Print"></span>');

        var gadget = new cloudprint.Gadget();
        gadget.setPrintButton(document.getElementById('print-treasure-' + numItem));
        //div id to contain the button
        gadget.setPrintDocument("url", relicObj.name + " [Savage Worlds Fantasy Companion Loot Generator]", item_url );
        //Google Cloud Print Button End -->
}

// Begin Loot Tables
function magicItemType() {
    var result, relicType,
        table_magicItemObj = {
            armor_shields: {
                relic: function() {
                    table1A_armorShields();
                },
                canBeIntelligent: true,
                lower: 1,
                upper: 2
            },
            melee_weapon: {
                relic: function() {
                    table2A_meleeWeaponType();
                },
                canBeIntelligent: true,
                lower: 3,
                upper: 5
            },
            ranged_weapon: {
                relic: function() {
                    table3A_rangedWeaponType();
                },
                canBeIntelligent: true,
                lower: 6,
                upper: 7
            },
            miscellaneous_item: {
                relic: function() {
                    table4_miscItemType();
                },
                canBeIntelligent: true,
                lower: 8,
                upper: 11
            },
            potions: {
                relic: function() {
                    table5_potions();
                },
                canBeIntelligent: false,
                lower: 12,
                upper: 14
            },
            rings: {
                relic: function() {
                    table6_rings();
                },
                canBeIntelligent: true,
                lower: 15,
                upper: 16
            },
            scrolls: {
                relic: function() {
                    table7_scrolls();
                },
                canBeIntelligent: false,
                lower: 17,
                upper: 18
            },
            tomes: {
                relic: function() {
                    table8_tomes();
                },
                canBeIntelligent: false,
                lower: 19,
                upper: 19
            },
            wands_staves: {
                relic: function() {
                    table9A_wandsStaves();
                },
                canBeIntelligent: true,
                lower: 20,
                upper: 20
            }
        };
    dieRoll = d(20);
    for (relicType in table_magicItemObj) {
        result = table_magicItemObj[relicType];
        if (dieRoll >= result.lower && dieRoll <= result.upper) {
            if (chosenTypesObj[relicType]) {
                result.relic();
                if (result.canBeIntelligent === true) {
                    var intelligentRelicRoll = d(20);
                    if (chosenTypesObj.intelligent || intelligentRelicRoll === 20) {
                        table11_intelligentRelics();
                    }
                }
            } else {
                magicItemType();
            }
            break;
        }
    }
}

//Armor and Shields
function table1A_armorShields() {

    var type, dieRoll = d(20),
        table1A_armorShieldsObj = {
            armor: {
                type: function() {
                    table1B_armor();
                },
                lower: 1,
                upper: 14
            },
            shield: {
                type: function() {
                    table1D_shieldType();
                },
                lower: 15,
                upper: 19
            },
            namedItem: {
                type: function() {
                    table1J_namedItems();
                },
                lower: 20,
                upper: 20
            },
        };

    for (type in table1A_armorShieldsObj) {
        result = table1A_armorShieldsObj[type];
        if (dieRoll >= result.lower && dieRoll <= result.upper) {
            table1A_armorShieldsObj[type].type();
        }
    }
}

function table1B_armor() {

    var size, result, armor, rerolled = false,
        armorSizeObj = {
            'Average-sized': {
                lower: 1,
                upper: 85
            },
            'Small': {
                lower: 86,
                upper: 95
            },
            'Large': {
                lower: 96,
                upper: 100
            }
        },
        table1B_armorObj = {
            "Leather": {
                cost: 50,
                lower: 1,
                upper: 7
            },
            "Chain Hauberk": {
                cost: 300,
                lower: 8,
                upper: 12
            },
            "Plate Corselet": {
                cost: 400,
                lower: 13,
                upper: 15
            },
            "Plate Arms (vambrace)": {
                cost: 200,
                lower: 16,
                upper: 16
            },
            "Plate Leggings (greaves)": {
                cost: 300,
                lower: 17,
                upper: 17
            },
            "Pot Helm": {
                cost: 75,
                lower: 18,
                upper: 19
            },
            "Steel Helmet": {
                cost: 150,
                lower: 20,
                upper: 20
            }
        };

    //roll for armor size
    dieRoll = d(100);
    for (size in armorSizeObj) {
        result = armorSizeObj[size];
        if (dieRoll >= result.lower && dieRoll <= result.upper) {
            relicObj.size = size;
            break;
        }
    }

    //roll for armor type
    dieRoll = d(20);
    for (item in table1B_armorObj) {
        result = table1B_armorObj[item];
        if (dieRoll >= result.lower && dieRoll <= result.upper) {
            relicObj.name = item;
            relicObj.cost += result.cost;
            /*Roll on Table 1C to determine the specific bonus.*/
            table1C_armorBonus(rerolled);
            break;
        }
    }
}

function table1C_armorBonus(rerolled) {

    var bonus, result,
        table1C_armorBonusObj = {
            "+1 Toughness": {
                cost: 1000,
                lower: 1,
                upper: 10
            },
            "+2 Toughness": {
                cost: 2000,
                lower: 11,
                upper: 16
            },
            "+3 Toughness": {
                cost: 3000,
                lower: 17,
                upper: 19
            },
            reroll: {
                special: function() {
                    rerollThis = true;
                    table1C_armorBonus(rerollThis);
                    table1F_rerolled = false;
                    table1F_specialArmorShields(table1F_rerolled);
                },
                lower: 20,
                upper: 20
            }
        };

    dieRoll = d(20);
    while (rerolled === true && dieRoll === 20) {
        dieRoll = d(20);
    }

    for (bonus in table1C_armorBonusObj) {
        result = table1C_armorBonusObj[bonus];
        if (dieRoll >= result.lower && dieRoll <= result.upper) {
            if (bonus !== 'reroll') {
                relicObj.bonus = bonus;
                relicObj.cost += result.cost;
            } else {
                table1C_armorBonusObj.reroll.special();
            }
            break;
        }
    }
}

function table1D_shieldType() {

    var item, result, rerolled = false,
        table1D_shieldTypeObj = {
            "Small Shield": {
                cost: 25,
                lower: 1,
                upper: 7
            },
            "Medium Shield": {
                cost: 50,
                lower: 8,
                upper: 15
            },
            "Large Shield": {
                cost: 200,
                lower: 16,
                upper: 20
            }
        };

    //roll for shield size/type
    dieRoll = d(20);
    for (item in table1D_shieldTypeObj) {
        result = table1D_shieldTypeObj[item];
        if (dieRoll >= result.lower && dieRoll <= result.upper) {
            relicObj.name = item;
            relicObj.cost += result.cost;
            //roll for bonus
            table1E_shieldBonus(rerolled);
            break;
        }
    }
}

function table1E_shieldBonus(rerolled) {

    var bonus,
        result, table1E_shieldBonusObj = {
            "+1 Parry (Block)": {
                cost: 1000,
                lower: 1,
                upper: 10
            },
            "+2 Parry (Improved Block)": {
                cost: 2000,
                lower: 11,
                upper: 19
            },
            reroll: {
                special: function() {
                    rerollThis = true;
                    table1E_shieldBonus(rerollThis);
                    table1F_rerolled = false;
                    table1F_specialArmorShields(table1F_rerolled);
                },
                lower: 20,
                upper: 20
            },
        };
    dieRoll = d(20);

    while (rerolled === true && dieRoll === 20) {
        dieRoll = d(20);
    }

    for (bonus in table1E_shieldBonusObj) {
        result = table1E_shieldBonusObj[bonus];
        if (dieRoll >= result.lower && dieRoll <= result.upper) {
            if (bonus !== 'reroll') {
                relicObj.bonus = bonus;
                relicObj.cost += result.cost;
            } else {
                //Woo-hoo! Reroll!
                table1E_shieldBonusObj.reroll.special();
            }
            break;
        }
    }
}

function table1F_specialArmorShields(rerolled) {
    var table1F_specialArmorShieldsObj = {
        "Skill Bonuses": {
            special: function() {
                var numSkills = d(6);
                table1G_skillBonuses(numSkills);
            },
            lower: 1,
            upper: 9
        },
        "Edges": {
            special: function() {
                var numEdges = d(3);
                table1H_edges(numEdges);
            },
            lower: 10,
            upper: 13
        },
        "Minor Artifact": {
            special: function() {
                var numPowers = d(2);
                table1I_powers(numPowers, 'Minor Artifact');
            },
            lower: 14,
            upper: 16
        },
        "Major Artifact": {
            special: function() {
                table1I_powers(1, 'Major Artifact');
            },
            lower: 17,
            upper: 18
        },
        "Major Artifact with raise": {
            special: function() {
                table1I_powers(1, 'Major Artifact with raise');
            },
            lower: 19,
            upper: 19
        },
        reroll: {
            special: function() {
                var rerollThis = true;
                table1F_specialArmorShields(rerollThis);
            },
            lower: 20,
            upper: 20
        }
    };

    processSpecial(table1F_specialArmorShieldsObj,rerolled);
}

function table1G_skillBonuses(numSkills) {
    var i = 0,
        skill, result, dieRoll, table1G_skillBonusesObj = {
            "Climbing": {
                lower: 1,
                upper: 4
            },
            "Intimidation": {
                lower: 5,
                upper: 7
            },
            "Persuasion": {
                lower: 8,
                upper: 10
            },
            "Stealth": {
                lower: 11,
                upper: 14
            },
            "Swimming": {
                lower: 15,
                upper: 17
            },
            "Taunt": {
                lower: 18,
                upper: 20
            }
        };

    while (++i <= numSkills) {
        dieRoll = d(20);
        for (skill in table1G_skillBonusesObj) {
            result = table1G_skillBonusesObj[skill];
            if (dieRoll >= result.lower && dieRoll <= result.upper) {
                //If relicObj doesn't have skill bonuses, add the property.
                if (!relicObj["skill bonuses"]) {
                    relicObj["skill bonuses"] = {};
                }
                if (!relicObj["skill bonuses"][skill]) {
                    //if relicObj doesn't have this skill, add it and set bonus to 1.
                    relicObj["skill bonuses"][skill] = 1;
                } else if (relicObj["skill bonuses"][skill] && relicObj["skill bonuses"][skill] < 3) {
                    //if relicObj does have this skill and it's less than 3, increase the bonus.
                    relicObj["skill bonuses"][skill] += 1;
                } else {
                    i--;
                }
                break;
            }
        }
    }
    relicObj.cost += (numSkills * 1000);
}

function table1H_edges(numEdges) {
    var table1H_edgesObj = {
        "Arcane Resistance": {
            cost: 2000,
            improved: "Improved Arcane Resistance",
            lower: 1,
            upper: 3
        },
        "Berserk": {
            cost: 2000,
            lower: 4,
            upper: 5
        },
        "Charismatic": {
            cost: 2000,
            lower: 6,
            upper: 7
        },
        "Command": {
            cost: 2000,
            lower: 8,
            upper: 8
        },
        "Danger Sense": {
            cost: 2000,
            lower: 9,
            upper: 9
        },
        "Dodge": {
            cost: 6000,
            improved: "Improved Dodge",
            lower: 10,
            upper: 11
        },
        "Fleet Footed": {
            cost: 2000,
            lower: 12,
            upper: 13
        },
        "Hard to Kill": {
            cost: 2000,
            improved: "Harder to Kill",
            lower: 14,
            upper: 15
        },
        "Harder to Kill": {
            cost: 8000,
            improved: true,
            required: "Hard to Kill",
            lower: 16,
            upper: 16
        },
        "Improved Arcane Resistance": {
            cost: 4000,
            improved: true,
            required: "Arcane Resistance",
            lower: 17,
            upper: 17
        },
        "Improved Dodge": {
            cost: 14000,
            improved: true,
            required: "Dodge",
            lower: 18,
            upper: 18
        },
        "Quick": {
            cost: 2000,
            lower: 19,
            upper: 20
        }
    };
    processEdges(table1H_edgesObj, numEdges);
}

function table1I_powers(numPowers, artifactType) {
    var table1I_powersObj = {
        "beast friend": {
            rank: 'Novice',
            "Major Artifact": {
                withRaise: false,
                basePowerPoints: 3,
                effects: function() {
                    var size = d(11) - 1,
                        powerPoints = this.basePowerPoints + (2 * size),
                        powerEffect, swarmSize, swarmSizeResult, swarmSizesObj = {
                            "Small": {
                                lower: 3,
                                upper: 4
                            },
                            "Medium": {
                                lower: 5,
                                upper: 7
                            },
                            "Large": {
                                lower: 8,
                                upper: 23
                            }
                        };

                    for (swarmSize in swarmSizesObj) {
                        swarmSizeResult = swarmSizesObj[swarmSize];
                        if (powerPoints >= swarmSizeResult.lower && powerPoints <= swarmSizeResult.upper) {
                            powerEffect = 'max. creature size: +' + size + '; max. swarm size: ' + swarmSize;
                            break;
                        }
                    }

                    return [powerEffect, powerPoints];
                }
            },
            lower: 1,
            upper: 1
        },
        "boost trait": {
            rank: 'Novice',
            "Major Artifact": {
                withRaise: true,
                basePowerPoints: 2,
                effects: function() {
                    var powerEffect, trait, targets = d(6) - 1,
                        powerPoints = this.basePowerPoints + targets;

                    if (relicObj.name === 'pot helm' || relicObj.name === 'steel helmet') {
                        switch (d(2)) {
                            case 1:
                                trait = 'Smarts';
                                break;
                            case 2:
                                trait = 'Spirit';
                                break;
                        }
                    } else {
                        switch (d(3)) {
                            case 1:
                                trait = 'Agility';
                                break;
                            case 2:
                                trait = 'Strength';
                                break;
                            case 3:
                                trait = 'Vigor';
                                break;
                        }
                    }

                    if (targets === 0) {
                        powerEffect = trait + '; self only';
                    } else {
                        powerEffect = trait + '; max. ' + targets + ' additional targets';
                    }

                    return [powerEffect, powerPoints];
                }
            },
            lower: 2,
            upper: 3
        },
        "burrow": {
            rank: 'Novice',
            "Major Artifact": {
                withRaise: true,
                basePowerPoints: 3,
                effects: function() {
                    var powerEffect, targets = d(6) - 1,
                        powerPoints = this.basePowerPoints + targets;

                    if (targets === 0) {
                        powerEffect = 'self only';
                    } else {
                        powerEffect = 'max. additional targets: ' + targets;
                    }
                    return [powerEffect, powerPoints];
                }
            },
            lower: 4,
            upper: 5
        },
        "burst": {
            rank: 'Novice',
            "Major Artifact": {
                withRaise: false,
                basePowerPoints: 2
            },
            lower: 6,
            upper: 6
        },
        "deflection": {
            rank: 'Novice',
            "Major Artifact": {
                withRaise: true,
                basePowerPoints: 2
            },
            lower: 7,
            upper: 7
        },
        "environmental protection": {
            rank: 'Novice',
            "Major Artifact": {
                withRaise: true,
                basePowerPoints: 2,
                effects: function() {
                    var powerEffect, targets = d(6) - 1,
                        powerPoints = this.basePowerPoints + targets;

                    if (targets === 0) {
                        powerEffect = 'self only';
                    } else {
                        powerEffect = 'max. additional targets: ' + targets;
                    }

                    return [powerEffect, powerPoints];
                }
            },
            lower: 8,
            upper: 10
        },
        "fear": {
            rank: 'Novice',
            "Major Artifact": {
                withRaise: true,
                basePowerPoints: 2
            },
            lower: 11,
            upper: 11
        },
        "fly": {
            rank: 'Veteran',
            "Major Artifact": {
                withRaise: true,
                basePowerPoints: (3 * d(2)),
                effects: function() {
                    var powerEffect, targets = d(6) - 1,
                        powerPoints = this.basePowerPoints + targets;

                    if (targets === 0) {
                        switch (this.basePowerPoints) {
                            case 3:
                                powerEffect = 'Pace; Climb 0; self only';
                                break;
                            case 6:
                                powerEffect = 'Pace x2; Climb 0; self only';
                                break;
                        }
                    } else {
                        switch (this.basePowerPoints) {
                            case 3:
                                powerEffect = 'Pace; Climb 0; max. additional targets: ' + targets;
                                break;
                            case 6:
                                powerEffect = 'Pace x2; Climb 0; max. additional targets: ' + targets;
                                break;
                        }
                    }

                    return [powerEffect, powerPoints];
                }
            },
            lower: 12,
            upper: 12
        },
        "invisibility": {
            rank: 'Seasoned',
            "Major Artifact": {
                withRaise: true,
                basePowerPoints: 5,
                effects: function() {
                    var powerEffect, targets = d(6) - 1,
                        powerPoints = this.basePowerPoints + targets;

                    if (targets === 0) {
                        powerEffect = 'self only';
                    } else {
                        powerEffect = 'max. additional targets: ' + targets;
                    }

                    return [powerEffect, powerPoints];
                }
            },
            lower: 13,
            upper: 14
        },
        "quickness": {
            rank: 'Seasoned',
            "Major Artifact": {
                withRaise: true,
                basePowerPoints: 4
            },
            lower: 15,
            upper: 16
        },
        "shape change": {
            rank: 'Legendary',
            "Major Artifact": {
                withRaise: false,
                basePowerPoints: 3,
                effects: function() {
                    var powerEffect, powerRank, powerPoints, shapeRoll = d(5);

                    switch (shapeRoll) {
                        case 1:
                            powerRank = 'Novice';
                            powerPoints = 3;
                            break;
                        case 2:
                            powerRank = 'Seasoned';
                            powerPoints = 4;
                            break;
                        case 3:
                            powerRank = 'Veteran';
                            powerPoints = 5;
                            break;
                        case 4:
                            powerRank = 'Heroic';
                            powerPoints = 6;
                            break;
                        case 5:
                            powerRank = 'Legendary';
                            powerPoints = 7;
                            break;
                    }

                    powerEffect = powerRank + ' animal';

                    return [powerEffect, powerPoints, powerRank];
                }
            },
            lower: 17,
            upper: 17
        },
        "speed": {
            rank: 'Novice',
            "Major Artifact": {
                withRaise: true,
                basePowerPoints: 1
            },
            lower: 18,
            upper: 19
        },
        "teleport": {
            rank: 'Seasoned',
            "Major Artifact": {
                withRaise: true,
                basePowerPoints: 3
            },
            lower: 20,
            upper: 20
        }
    };
    processPowers(table1I_powersObj, numPowers, artifactType);
}

function table1J_namedItems() {

    var item, result, table1J_namedItemsObj = {
            "Assassin's Armor": {
                cost: 6550,
                page: 51,
                lower: 1,
                upper: 2
            },
            "Breastplate of Heroes": {
                cost: 2400,
                page: 51,
                lower: 3,
                upper: 7
            },
            "Dragon Shield": {
                cost: 5150,
                page: 51,
                lower: 8,
                upper: 9
            },
            "Dragon Slayer's Armor": {
                cost: 4300,
                page: 51,
                lower: 10,
                upper: 12
            },
            "Hauberk of the Mage Slayer": {
                cost: 5300,
                page: 51,
                lower: 13,
                upper: 15
            },
            "Helm of the General": {
                cost: 4650,
                page: 51,
                lower: 16,
                upper: 17
            },
            "Thief's Jerkin": {
                cost: 2050,
                page: 51,
                lower: 18,
                upper: 20
            }
        };

    dieRoll = d(20);
    for (item in table1J_namedItemsObj) {
        result = table1J_namedItemsObj[item];
        if (dieRoll >= result.lower && dieRoll <= result.upper) {
            relicObj.name = item;
            relicObj.cost = result.cost;
            relicObj.page = result.page;
            break;
        }
    }
}

//Table 2: Melee Weapons
function table2A_meleeWeaponType() {
    var namedItem = false;

    if (d(20) === 20){
        if (chosenTypesObj.adjusted === true || (chosenTypesObj.adjusted === undefined && d(20) === 20)){
            namedItem = true;
        }
    }

    if (namedItem === true){
         table3G_namedRangedWeapons();
    } else {
        var result, item, groupRoll, rerolled = false,
            table2A_meleeWeaponsObj = {
                "Axe": {
                    cost: 200,
                    group: 1,
                    lower: 1,
                    upper: 3
                },
                "Battle Axe": {
                    cost: 300,
                    group: 1,
                    lower: 4,
                    upper: 5
                },
                "Dagger": {
                    cost: 25,
                    group: 1,
                    lower: 6,
                    upper: 9
                },
                "Flail": {
                    cost: 200,
                    group: 1,
                    lower: 10,
                    upper: 10
                },
                "Great Axe": {
                    cost: 500,
                    group: 2,
                    lower: 1,
                    upper: 2
                },
                "Great Sword": {
                    cost: 400,
                    group: 2,
                    lower: 3,
                    upper: 4
                },
                "Halberd": {
                    cost: 250,
                    group: 2,
                    lower: 5,
                    upper: 5
                },
                "Katana": {
                    cost: 1000,
                    group: 2,
                    lower: 6,
                    upper: 6
                },
                "Long Sword": {
                    cost: 300,
                    group: 2,
                    lower: 7,
                    upper: 10
                },
                "Named Item": {
                    namedItem: function() {
                        table2G_namedItems();
                    },
                    group: 3,
                    lower: 1,
                    upper: 1
                },
                "Lance": {
                    cost: 500,
                    group: 3,
                    lower: 2,
                    upper: 2
                },
                "Maul": {
                    cost: 400,
                    group: 3,
                    lower: 3,
                    upper: 3
                },
                "Pike": {
                    cost: 40,
                    group: 3,
                    lower: 4,
                    upper: 5
                },
                "Rapier": {
                    cost: 150,
                    group: 3,
                    lower: 6,
                    upper: 8
                },
                "Saber": {
                    cost: 200,
                    group: 3,
                    lower: 9,
                    upper: 10
                },
                "Short Sword": {
                    cost: 200,
                    group: 4,
                    lower: 1,
                    upper: 4
                },
                "Spear": {
                    cost: 250,
                    group: 4,
                    lower: 5,
                    upper: 6
                },
                "Staff": {
                    cost: 10,
                    group: 4,
                    lower: 7,
                    upper: 9
                },
                "Warhammer": {
                    cost: 250,
                    group: 4,
                    lower: 10,
                    upper: 10
                }
            };

        //roll for melee weapon type
        groupRoll = d(4);
        dieRoll = d(10);
        for (item in table2A_meleeWeaponsObj) {
            result = table2A_meleeWeaponsObj[item];
            if (groupRoll === result.group && dieRoll >= result.lower && dieRoll <= result.upper) {
                if (item === "Named Item") {
                    result.namedItem();
                } else {
                    relicObj.name = item;
                    relicObj.cost += result.cost;
                    //Roll on Table 2B to determine the specific bonus.
                    table2B_damageBonus(rerolled);
                }
                break;
            }
        }
    }
}

function table2B_damageBonus(rerolled) {

    var bonus, result,
        table2B_damageBonusObj = {
            bonus1: {
                bonus: "+1 damage",
                cost: 1000,
                lower: 1,
                upper: 5
            },
            bonus2: {
                bonus: "+2 damage",
                cost: 2000,
                lower: 6,
                upper: 10
            },
            bonus3: {
                bonus: "+3 damage",
                cost: 3000,
                lower: 11,
                upper: 13
            },
            bonus4: {
                bonus: "+1 damage",
                fightingBonus: function() {
                    table2C_fightingBonus();
                },
                cost: 1000,
                lower: 14,
                upper: 16
            },
            bonus5: {
                bonus: "+2 damage",
                fightingBonus: function() {
                    table2C_fightingBonus();
                },
                cost: 2000,
                lower: 17,
                upper: 18
            },
            bonus6: {
                bonus: "+3 damage",
                fightingBonus: function() {
                    table2C_fightingBonus();
                },
                cost: 3000,
                lower: 19,
                upper: 19
            },
            reroll: {
                special: function() {
                    rerollThis = true;
                    table2B_damageBonus(rerollThis);
                    table2D_rerolled = false;
                    table2D_specialWeapons(table2D_rerolled);
                },
                lower: 20,
                upper: 20
            }
        };

    dieRoll = d(20);

    while (rerolled === true && dieRoll === 20) {
        dieRoll = d(20);
    }

    for (bonus in table2B_damageBonusObj) {
        result = table2B_damageBonusObj[bonus];
        if (dieRoll >= result.lower && dieRoll <= result.upper) {
            if (bonus !== 'reroll') {
                relicObj.bonus = result.bonus;
                if (result.fightingBonus !== undefined) {
                    result.fightingBonus();
                }
                relicObj.cost += result.cost;
            } else {
                table2B_damageBonusObj.reroll.special();
            }
            break;
        }
    }
}

function table2C_fightingBonus(rerolled) {

    var fightingBonus, result,
        table2C_fightingBonusObj = {
            bonus1: {
                bonus: "+1 Fighting",
                cost: 1000,
                lower: 1,
                upper: 10
            },
            bonus2: {
                bonus: "+2 Fighting",
                cost: 2000,
                lower: 11,
                upper: 16
            },
            bonus3: {
                bonus: "+3 Fighting",
                cost: 3000,
                lower: 17,
                upper: 20
            }
        };

    dieRoll = d(20);

    for (bonus in table2C_fightingBonusObj) {
        result = table2C_fightingBonusObj[bonus];
        if (dieRoll >= result.lower && dieRoll <= result.upper) {
            relicObj.bonus = result.bonus + '; ' + relicObj.bonus;
            relicObj.cost += result.cost;
            break;
        }
    }
}

function table2D_specialWeapons(rerolled) {
    var table2D_specialWeaponsObj = {
            "Edges": {
                special: function() {
                    var numEdges = d(3);
                    table2E_edges(numEdges);
                },
                lower: 1,
                upper: 13
            },
            "Minor Artifact": {
                special: function() {
                    var numPowers = d(2);
                    table2F_powers(numPowers, 'Minor Artifact');
                },
                lower: 14,
                upper: 16
            },
            "Major Artifact": {
                special: function() {
                    table2F_powers(1, 'Major Artifact');
                },
                lower: 17,
                upper: 18
            },
            "Major Artifact with raise": {
                special: function() {
                    table2F_powers(1, 'Major Artifact with raise');
                },
                lower: 19,
                upper: 19
            },
            reroll: {
                special: function() {
                    var rerollThis = true;
                    table2D_specialWeapons(rerollThis);
                },
                lower: 20,
                upper: 20
            }
        };

    processSpecial(table2D_specialWeapons,rerolled);
}

function table2E_edges(numEdges) {
    var table2E_edgesObj = {
        "Ambidextrous": {
            cost: 2000,
            lower: 1,
            upper: 2
        },
        "Berserk": {
            cost: 2000,
            lower: 3,
            upper: 3
        },
        "Block": {
            cost: 4000,
            improved: "Improved Block",
            lower: 4,
            upper: 6
        },
        "Command": {
            cost: 2000,
            lower: 7,
            upper: 7
        },
        "First Strike": {
            cost: 2000,
            lower: 8,
            upper: 9
        },
        "Frenzy": {
            cost: 4000,
            improved: "Improved Frenzy",
            lower: 10,
            upper: 10
        },
        "Giant Killer": {
            cost: 6000,
            lower: 11,
            upper: 12
        },
        "Improved Block": {
            cost: 10000,
            improved: true,
            required: "Block",
            lower: 13,
            upper: 13
        },
        "Improved First Strike": {
            cost: 12000,
            improved: true,
            required: "First Strike",
            lower: 14,
            upper: 14
        },
        "Improved Frenzy": {
            cost: 10000,
            improved: true,
            required: "Frenzy",
            lower: 15,
            upper: 15
        },
        "Improved Sweep": {
            cost: 8000,
            improved: true,
            required: "Frenzy",
            lower: 16,
            upper: 16
        },
        "Quick Draw": {
            cost: 2000,
            lower: 17,
            upper: 18
        },
        "Sweep": {
            cost: 2000,
            improved: "Improved Sweep",
            lower: 19,
            upper: 20
        }
    };
    processEdges(table2E_edgesObj, numEdges);
}

function table2F_powers(numPowers, artifactType) {
    var table2F_powersObj = {
        "armor": {
            rank: 'Novice',
            "Major Artifact": {
                withRaise: true,
                basePowerPoints: 2
            },
            lower: 1,
            upper: 3
        },
        "boost trait": {
            rank: 'Novice',
            "Major Artifact": {
                withRaise: true,
                basePowerPoints: 2,
                effects: function() {
                    var trait, powerEffect, targets = d(6) - 1,
                        powerPoints = this.basePowerPoints + targets;
                    switch (d(2)) {
                        case 1:
                            trait = 'Strength';
                            break;
                        case 2:
                            trait = 'Vigor';
                            break;
                    }

                    if (targets === 0) {
                        powerEffect = trait + '; self only';
                    } else {
                        powerEffect = trait + '; max. ' + targets + ' additional targets';
                    }

                    return [powerEffect, powerPoints];
                }
            },
            lower: 4,
            upper: 7
        },
        "burst": {
            rank: 'Novice',
            "Major Artifact": {
                withRaise: false,
                basePowerPoints: 2
            },
            lower: 8,
            upper: 9
        },
        "fear": {
            rank: 'Novice',
            "Major Artifact": {
                withRaise: true,
                basePowerPoints: 2
            },
            lower: 10,
            upper: 11
        },
        "light": {
            rank: 'Novice',
            "Major Artifact": {
                withRaise: false,
                basePowerPoints: 2
            },
            lower: 12,
            upper: 15
        },
        "quickness": {
            rank: 'Seasoned',
            "Major Artifact": {
                withRaise: true,
                basePowerPoints: 4
            },
            lower: 16,
            upper: 17
        },
        "smite": {
            rank: 'Novice',
            "Major Artifact": {
                withRaise: true,
                basePowerPoints: 2,
                effects: function() {
                    var powerEffect, targets = d(6) - 1,
                        powerPoints = this.basePowerPoints + targets;

                    if (targets === 0) {
                        powerEffect = 'fire trapping; self only';
                    } else {
                        powerEffect = 'fire trapping; max. additional targets: ' + targets;
                    }

                    return [powerEffect, powerPoints];
                }
            },
            lower: 18,
            upper: 20
        },
    };
    processPowers(table2F_powersObj, numPowers, artifactType);
}

function table2G_namedItems() {

    var item, result, table2G_namedItemsObj = {
            "Axe of the Berserker": {
                cost: 7500,
                page: 53,
                lower: 1,
                upper: 2
            },
            "Duelist's Blade": {
                cost: 13150,
                page: 53,
                lower: 3,
                upper: 5
            },
            "Fearmonger": {
                cost: 9025,
                page: 53,
                lower: 6,
                upper: 7
            },
            "Giant Slayer": {
                cost: 5500,
                page: 54,
                lower: 8,
                upper: 10
            },
            "Head Taker": {
                cost: 1900,
                page: 54,
                lower: 11,
                upper: 13
            },
            "Orcbane": {
                cost: 3300,
                page: 54,
                lower: 14,
                upper: 17
            },
            "Pathblocker": {
                cost: 14250,
                page: 51,
                lower: 18,
                upper: 20
            }
        };

    dieRoll = d(20);
    for (item in table2G_namedItemsObj) {
        result = table2G_namedItemsObj[item];
        if (dieRoll >= result.lower && dieRoll <= result.upper) {
            relicObj.name = item;
            relicObj.cost = result.cost;
            relicObj.page = result.page;
            break;
        }
    }
}

//Table 3: Ranged Items
function table3A_rangedWeaponType() {
    var namedItem = false;

    if (d(20) === 20){
        if (chosenTypesObj.adjusted === true || (chosenTypesObj.adjusted === undefined && d(20) === 20)){
            namedItem = true;
        }
    }

    if (namedItem === true){
         table3G_namedRangedWeapons();
    } else {
        var result, item, table3A_rangedWeaponTypeObj = {}, rerolled = false,
            rangeMultiplier = 1,
            table3A_standardFantasyObj = {
                "Axe, throwing": {
                    cost: 75,
                    skill: "Throwing",
                    baseRange: 3,
                    lower: 1,
                    upper: 3
                },
                "Bow": {
                    cost: 250,
                    skill: "Shooting",
                    baseRange: 12,
                    lower: 4,
                    upper: 8
                },
                "Crossbow": {
                    cost: 500,
                    skill: "Shooting",
                    baseRange: 15,
                    reloadRate: 1,
                    lower: 9,
                    upper: 10
                },
                "English Long Bow": {
                    cost: 200,
                    skill: "Shooting",
                    baseRange: 15,
                    lower: 11,
                    upper: 12
                },
                "Knife/Dagger": {
                    cost: 25,
                    skill: "Throwing",
                    baseRange: 3,
                    lower: 13,
                    upper: 15
                },
                "Sling": {
                    cost: 10,
                    skill: "Throwing",
                    baseRange: 4,
                    lower: 16,
                    upper: 17
                },
                "Spear/Javelin": {
                    cost: 250,
                    skill: "Throwing",
                    baseRange: 3,
                    lower: 18,
                    upper: 20
                }
            }, table3A_blackpowderFantasyObj = {
                "Axe, throwing": {
                    cost: 75,
                    skill: "Throwing",
                    baseRange: 3,
                    lower: 1,
                    upper: 2
                },
                "Bow": {
                    cost: 250,
                    skill: "Shooting",
                    baseRange: 12,
                    lower: 3,
                    upper: 4
                },
                "Crossbow": {
                    cost: 500,
                    skill: "Shooting",
                    baseRange: 15,
                    reloadRate: 1,
                    lower: 5,
                    upper: 7
                },
                "English Long Bow": {
                    cost: 200,
                    skill: "Shooting",
                    baseRange: 15,
                    lower: 8,
                    upper: 8
                },
                "Knife/Dagger": {
                    cost: 25,
                    skill: "Throwing",
                    baseRange: 3,
                    lower: 9,
                    upper: 10
                },
                "Sling": {
                    cost: 10,
                    skill: "Throwing",
                    baseRange: 4,
                    lower: 11,
                    upper: 11
                },
                "Spear/Javelin": {
                    cost: 250,
                    skill: "Throwing",
                    baseRange: 3,
                    lower: 12,
                    upper: 12
                },
                "Musket": {
                    cost: 300,
                    skill: "Shooting",
                    baseRange: 3,
                    reloadRate: 2,
                    lower: 13,
                    upper: 14
                },
                "Blunderbuss": {
                    cost: 300,
                    skill: "Shooting",
                    baseRange: 10,
                    reloadRate: 2,
                    lower: 15,
                    upper: 16
                },
                "Flintlock Pistol": {
                    cost: 150,
                    skill: "Shooting",
                    baseRange: 5,
                    reloadRate: 2,
                    lower: 17,
                    upper: 20
                }
            };

        if (chosenTypesObj.blackpowder === true) {
            table3A_rangedWeaponTypeObj = table3A_blackpowderFantasyObj;
        } else {
            table3A_rangedWeaponTypeObj = table3A_standardFantasyObj;
        }

        //roll for ranged weapon type
        dieRoll = d(20);
        for (item in table3A_rangedWeaponTypeObj) {
            result = table3A_rangedWeaponTypeObj[item];
            if (dieRoll >= result.lower && dieRoll <= result.upper) {
                relicObj.name = item;
                relicObj.cost += result.cost;
                //Store range calculators
                relicObj.baseRange = result.baseRange;
                relicObj.rangeMultiplier = rangeMultiplier;
                //store reload rate
                if (result.reloadRate) {
                    relicObj.reloadRate = result.reloadRate;
                }
                //Store ranged attack skill
                relicObj.rangedAttackSkill = result.skill;
                //Roll on Table 2B to determine the specific bonus.
                table3B_damageBonus(rerolled);
                if (relicObj.rangeMultiplier > 1) {
                    var newBaseRangeIncrement = relicObj.baseRange * relicObj.rangeMultiplier;
                    relicObj.range = newBaseRangeIncrement + '/' + (newBaseRangeIncrement * 2) + '/' + (newBaseRangeIncrement * 4);
                }
                break;
            }
        }
    }
}

function table3B_damageBonus(rerolled) {

    var bonus, result,
        table3B_damageBonusObj = {
            bonus1: {
                bonus: "+1 damage",
                cost: 1000,
                lower: 1,
                upper: 5
            },
            bonus2: {
                bonus: "+2 damage",
                cost: 2000,
                lower: 6,
                upper: 10
            },
            bonus3: {
                bonus: "+3 damage",
                cost: 3000,
                lower: 11,
                upper: 13
            },
            bonus4: {
                bonus: "+1 damage",
                shootingBonus: function() {
                    table3C_shootingBonus();
                },
                cost: 1000,
                lower: 14,
                upper: 16
            },
            bonus5: {
                bonus: "+2 damage",
                shootingBonus: function() {
                    table3C_shootingBonus();
                },
                cost: 2000,
                lower: 17,
                upper: 18
            },
            bonus6: {
                bonus: "+3 damage",
                shootingBonus: function() {
                    table3C_shootingBonus();
                },
                cost: 3000,
                lower: 19,
                upper: 19
            },
            reroll: {
                special: function() {
                    rerollThis = true;
                    table3B_damageBonus(rerollThis);
                    table3D_rerolled = false;
                    table3D_specialWeapons(table3D_rerolled);
                },
                lower: 20,
                upper: 20
            }
        };

        dieRoll = d(20);

        while (rerolled === true && dieRoll === 20) {
            dieRoll = d(20);
        }

        for (bonus in table3B_damageBonusObj) {
            result = table3B_damageBonusObj[bonus];
            if (dieRoll >= result.lower && dieRoll <= result.upper) {
                if (bonus !== 'reroll') {
                    relicObj.bonus = result.bonus;
                    if (result.shootingBonus !== undefined) {
                        result.shootingBonus();
                    }
                    relicObj.cost += result.cost;
                } else {
                    result.special();
                }
                break;
            }
        }
}

function table3C_shootingBonus(rerolled) {

    var bonus, result,
        table3C_shootingBonusObj = {
            bonus1: {
                bonus: "+1",
                cost: 1000,
                lower: 1,
                upper: 8
            },
            bonus2: {
                bonus: "+2",
                cost: 2000,
                lower: 9,
                upper: 14
            },
            bonus3: {
                bonus: "+3",
                cost: 3000,
                lower: 15,
                upper: 18
            },
            bonus4: {
                cost: 2000,
                increasedRange: function() {
                    relicObj.rangeMultiplier++;
                },
                lower: 19,
                upper: 20
            }
        };

    dieRoll = d(20);
    for (bonus in table3C_shootingBonusObj) {
        result = table3C_shootingBonusObj[bonus];
        if (dieRoll >= result.lower && dieRoll <= result.upper) {
            if (result.increasedRange === undefined)
                relicObj.bonus = result.bonus + ' ' + relicObj.rangedAttackSkill + '; ' + relicObj.bonus;
            else {
                result.increasedRange();
            }
            relicObj.cost += result.cost;
            break;
        }
    }
}

function table3D_specialWeapons(rerolled) {
    var table3D_specialWeaponsObj = {
            "Edges": {
                special: function() {
                    var numEdges = d(3);
                    table3E_edges(numEdges);
                },
                lower: 1,
                upper: 13
            },
            "Minor Artifact": {
                special: function() {
                    var numPowers = d(2);
                    table3F_powers(numPowers, 'Minor Artifact');
                },
                lower: 14,
                upper: 16
            },
            "Major Artifact": {
                special: function() {
                    table3F_powers(1, 'Major Artifact');
                },
                lower: 17,
                upper: 18
            },
            "Major Artifact with raise": {
                special: function() {
                    table3F_powers(1, 'Major Artifact with raise');
                },
                lower: 19,
                upper: 19
            },
            reroll: {
                special: function() {
                    var rerollThis = true;
                    table3D_specialWeapons(rerollThis);
                },
                lower: 20,
                upper: 20
            }
        };

    processSpecial(table3D_specialWeaponsObj,rerolled);
}

function table3E_edges(numEdges) {
    var table3E_edgesObj = {
        "Fast Load": {
            cost: 2000,
            lower: 1,
            upper: 2
        },
        "Increased Range": {
            cost: 2000,
            increasedRange: function() {
                relicObj.rangeMultiplier++;
            },
            lower: 3,
            upper: 7
        },
        "Marksman": {
            cost: 4000,
            lower: 8,
            upper: 12
        },
        "Quick Draw": {
            cost: 2000,
            lower: 13,
            upper: 15
        },
        "Steady Hands": {
            cost: 2000,
            lower: 16,
            upper: 20
        }
    };
    processEdges(table3E_edgesObj, numEdges);
}

function table3F_powers(numPowers, artifactType) {
    var table3F_powersObj = {
        "blast": {
            rank: 'Seasoned',
            "Major Artifact": {
                withRaise: false,
                basePowerPoints: d(3) * 2,
                effects: function() {
                    var powerEffect, powerPoints = this.basePowerPoints;

                    switch (powerPoints) {
                        case 2:
                            powerEffect = 'Medium Burst for 2d6 damage';
                            break;
                        case 4:
                            switch (d(2)) {
                                case 1:
                                    powerEffect = 'Medium Burst for 3d6 damage';
                                    break;
                                case 2:
                                    powerEffect = 'Large Burst for 2d6 damage';
                                    break;
                            }
                            break;
                        case 6:
                            powerEffect = 'Large Burst for 3d6 damage';
                            break;
                    }

                    return [powerEffect, powerPoints];
                }
            },
            lower: 1,
            upper: 2
        },
        "bolt": {
            rank: 'Novice',
            "Major Artifact": {
                withRaise: false,
                basePowerPoints: 1,
                effects: function() {
                    var powerEffect, damage = '2d6',
                        missiles = d(3),
                        powerPoints = missiles;
                    if (missiles === 1) {
                        if (d(2) === 2) {
                            damage = '3d6';
                            powerPoints = 2;
                        }
                        powerEffect = missiles + ' missile; ' + damage + ' damage';
                    } else {
                        powerEffect = missiles + ' missiles; ' + damage + ' damage';
                    }

                    return [powerEffect, powerPoints];
                }
            },
            lower: 3,
            upper: 6
        },
        "boost trait": {
            rank: 'Novice',
            "Major Artifact": {
                withRaise: true,
                basePowerPoints: 2,
                effects: function() {
                    var powerEffect, targets = d(6) - 1,
                        powerPoints = this.basePowerPoints + targets;

                    if (targets === 0) {
                        powerEffect = 'Agility; self only';
                    } else {
                        powerEffect = 'Agility; max. ' + targets + ' additional targets';
                    }

                    return [powerEffect, powerPoints];
                }
            },
            lower: 7,
            upper: 8
        },
        "entangle": {
            rank: 'Novice',
            "Major Artifact": {
                withRaise: true,
                basePowerPoints: 2 * d(2),
                effects: function() {
                    var powerEffect, powerPoints = this.basePowerPoints;

                    switch (powerPoints) {
                        case 2:
                            powerEffect = 'single target';
                            break;
                        case 4:
                            powerEffect = 'Medium Burst';
                            break;
                    }

                    return [powerEffect, powerPoints];
                }
            },
            lower: 9,
            upper: 11
        },
        "obscure": {
            rank: 'Novice',
            "Major Artifact": {
                withRaise: false,
                basePowerPoints: 2
            },
            lower: 12,
            upper: 13
        },
        "quickness": {
            rank: 'Seasoned',
            "Major Artifact": {
                withRaise: true,
                basePowerPoints: 4
            },
            lower: 14,
            upper: 15
        },
        "smite": {
            rank: 'Novice',
            "Major Artifact": {
                withRaise: true,
                basePowerPoints: 2,
                effects: function() {
                    var powerEffect, targets = d(6) - 1,
                        powerPoints = this.basePowerPoints + targets;

                    if (targets === 0) {
                        powerEffect = 'fire trapping; self only';
                    } else {
                        powerEffect = 'fire trapping; max. additional targets: ' + targets;
                    }

                    return [powerEffect, powerPoints];
                }
            },
            lower: 16,
            upper: 18
        },
        "stun": {
            rank: 'Novice',
            "Major Artifact": {
                withRaise: true,
                basePowerPoints: 2
            },
            lower: 19,
            upper: 20
        }
    };
    processPowers(table3F_powersObj, numPowers, artifactType);
}

function table3G_namedRangedWeapons() {

    var item, result, table3G_namedRangedWeaponsObj = {
            "Crossbow of Many Bolts": {
                cost: 10500,
                page: 56,
                lower: 1,
                upper: 2
            },
            "Dagger of Pinning": {
                cost: 2925,
                page: 56,
                lower: 3,
                upper: 5
            },
            "Dwarven Throwing Axe": {
                cost: 2075,
                page: 56,
                lower: 6,
                upper: 8
            },
            "Elf Bow": {
                cost: 7200,
                page: 56,
                lower: 9,
                upper: 10
            },
            "Fire Bow": {
                cost: 5250,
                page: 56,
                lower: 11,
                upper: 13
            },
            "Javelin of the Gods": {
                cost: 550,
                page: 56,
                lower: 14,
                upper: 17
            },
            "Nomad's Bow": {
                cost: 3250,
                page: 57,
                lower: 18,
                upper: 19
            },
            "Target Seeker": {
                cost: 9250,
                page: 57,
                lower: 20,
                upper: 20
            }
        };

    dieRoll = d(20);
    for (item in table3G_namedRangedWeaponsObj) {
        result = table3G_namedRangedWeaponsObj[item];
        if (dieRoll >= result.lower && dieRoll <= result.upper) {
            relicObj.name = item;
            relicObj.cost = result.cost;
            relicObj.page = result.page;
            break;
        }
    }
}

//Table 4: Miscellaneous Items
function table4_miscItemType() {
    var namedItem = false;

    if (d(20) === 20){
        if (chosenTypesObj.adjusted === true || (chosenTypesObj.adjusted === undefined && d(20) === 20)){
            namedItem = true;
            console.log(namedItem);
        }
    }

    if (namedItem === true){
        table4F_namedItems();
    } else {
        var result, item, rerolled = false, table4_miscItemTypeObj = {
                "Pendant": {
                    lower: 1,
                    upper: 1
                },
                "Figurine": {
                    lower: 2,
                    upper: 2
                },
                "Cloak": {
                    lower: 3,
                    upper: 3
                },
                "Boots": {
                    lower: 4,
                    upper: 4
                },
                "Shirt": {
                    lower: 5,
                    upper: 5
                },
                "Hat": {
                    lower: 6,
                    upper: 6
                },
                "Musical Instrument": {
                    lower: 7,
                    upper: 7
                },
                "Artwork": {
                    lower: 8,
                    upper: 8
                },
                "Dice": {
                    lower: 9,
                    upper: 9
                },
                "Scabbard": {
                    reloadRate: 1,
                    lower: 10,
                    upper: 10
                },
                "Card Deck": {
                    lower: 11,
                    upper: 11
                },
                "Key": {
                    lower: 12,
                    upper: 12
                },
                "Whistle": {
                    lower: 13,
                    upper: 13
                },
                "Horn": {
                    lower: 14,
                    upper: 14
                },
                "Coin": {
                    lower: 15,
                    upper: 15
                },
                "Cup": {
                    lower: 16,
                    upper: 16
                },
                "Tool": {
                    lower: 17,
                    upper: 17
                },
                "Container": {
                    lower: 18,
                    upper: 18
                },
                "Belt": {
                    lower: 19,
                    upper: 19
                },
                "Cape": {
                    lower: 20,
                    upper: 20
                }
            };

        //roll for misc. items type
        dieRoll = d(20);
        for (item in table4_miscItemTypeObj) {
            result = table4_miscItemTypeObj[item];
            if (dieRoll >= result.lower && dieRoll <= result.upper) {
                relicObj.name = item;

                //Roll on Table 4A to determine the specific bonus.
                table4A_itemPowers(rerolled);
                break;
            }
        }
    }
}

function table4A_itemPowers(rerolled) {
   var numRolls, i = 0, dieRoll, special, result, table4A_itemPowersObj = {
        "Skill Bonus": {
            special: function() {
                table4B_skill();
            },
            lower: 1,
            upper: 9
        },
        "Edges": {
            special: function() {
                numEdges = d(3);
                table4D_edges(numEdges);
            },
            lower: 10,
            upper: 13
        },
        "Minor Artifact": {
            special: function() {
                numPowers = d(2);
                table4E_powers(numPowers, 'Minor Artifact');
            },
            lower: 14,
            upper: 16
        },
        "Major Artifact": {
            special: function() {
                table4E_powers(1, 'Major Artifact');
            },
            lower: 17,
            upper: 18
        },
        "Major Artifact with raise": {
            special: function() {
                table4E_powers(1, 'Major Artifact with raise');
            },
            lower: 19,
            upper: 19
        },
        reroll: {
            special: function() {
                rerollThis = true;
                table4A_itemPowers(rerollThis);
            },
            lower: 20,
            upper: 20
        }
    };

    processSpecial(table4A_itemPowersObj,rerolled);
}

function table4B_skill() {
    var i = 0,
        skill, result, dieRoll, table4B_skillObj = {
            "Boating": {
                lower: 1,
                upper: 1
            },
            "Climbing": {
                lower: 2,
                upper: 2
            },
            "Fighting": {
                lower: 3,
                upper: 3
            },
            "Gambling": {
                lower: 4,
                upper: 4
            },
            "Healing": {
                lower: 5,
                upper: 5
            },
            "Intimidation": {
                lower: 6,
                upper: 6
            },
            "Investigation": {
                lower: 7,
                upper: 7
            },
            "Knowledge": {
                lower: 8,
                upper: 8
            },
            "Lockpicking": {
                lower: 9,
                upper: 9
            },
            "Notice": {
                lower: 10,
                upper: 10
            },
            "Persuasion": {
                lower: 11,
                upper: 11
            },
            "Riding": {
                lower: 12,
                upper: 12
            },
            "Shooting": {
                lower: 13,
                upper: 13
            },
            "Stealth": {
                lower: 14,
                upper: 14
            },
            "Streetwise": {
                lower: 15,
                upper: 15
            },
            "Survival": {
                lower: 16,
                upper: 16
            },
            "Swimming": {
                lower: 17,
                upper: 17
            },
            "Taunt": {
                lower: 18,
                upper: 18
            },
            "Throwing": {
                lower: 19,
                upper: 19
            },
            "Tracking": {
                lower: 20,
                upper: 20
            }
        };

        dieRoll = d(20);
        for (skill in table4B_skillObj) {
            result = table4B_skillObj[skill];
            if (dieRoll >= result.lower && dieRoll <= result.upper) {
                if (!relicObj["skill bonuses"]) {
                    relicObj["skill bonuses"] = {};
                }

                if (relicObj["skill bonuses"][skill]) {
                    //reroll this table
                    table4B_skill();
                } else {
                    //Pass the skill to roll for bonus
                    table4C_skillBonus(skill);
                }
                break;
            }
        }
}

function table4C_skillBonus(skill) {
    var i = 0,
        bonus, result, dieRoll, table4C_skillBonusObj = {
            1: {
                cost: 1000,
                lower: 1,
                upper: 12
            },
            2: {
                cost: 2000,
                lower: 13,
                upper: 17
            },
            3: {
                cost: 3000,
                lower: 18,
                upper: 20
            }
        };

    dieRoll = d(20);
    for (bonus in table4C_skillBonusObj) {
        result = table4C_skillBonusObj[bonus];
        if (dieRoll >= result.lower && dieRoll <= result.upper) {
            //If relicObj doesn't have skill bonuses, add the property.
            relicObj["skill bonuses"][skill] = bonus;
            relicObj.cost += result.cost;
            break;
        }
    }
}

function table4D_edges(numEdges) {
    var table4D_edgesObj = {
       "Ambidextrous": {
            cost: 2000,
            lower: 1,
            upper: 1
        },
        "Arcane Resistance": {
            cost: 2000,
            improved: "Improved Arcane Resistance",
            lower: 2,
            upper: 3
        },
         "Improved Arcane Resistance": {
            cost: 4000,
            required: "Arcane Resistance",
            lower: 0,
            upper: 0
        },
       "Charismatic": {
            cost: 2000,
            lower: 4,
            upper: 5
        },
        "Combat Reflexes": {
            cost: 4000,
            lower: 6,
            upper: 6
        },
        "Command": {
            cost: 2000,
            reroll:function() {
                var commandRerollObj = {
                    "Fervor": {
                        cost: 6000,
                        lower:1,
                        upper:5
                    },
                    "Hold the Line":{
                        cost:4000,
                        lower:6,
                        upper:10
                    },
                    "Inspire":{
                        cost: 4000,
                        lower:11,
                        upper:15
                    },
                    "Natural Leader":{
                        cost:4000,
                        lower:16,
                        upper:20
                    }
                };
                processEdges(commandRerollObj,1);
            },
            lower: 7,
            upper: 7
        },
        "Danger Sense": {
            cost: 2000,
            lower: 8,
            upper: 8
        },
        "Fast Healer": {
            cost: 2000,
            lower: 9,
            upper: 9
        },
        "Level Headed": {
            cost: 2000,
            improved: "Improved Level Headed",
            lower: 10,
            upper: 10
        },
        "Improved Level Headed": {
            cost: 4000,
            required:"Level Headed",
            lower: 0,
            upper: 0
        },
        "Luck": {
            cost: 2000,
            improved: "Great Luck",
            lower: 11,
            upper: 12
        },
        "Great Luck": {
            cost:4000,
            required:"Luck"
        },
        "Fleet Footed": {
            cost: 2000,
            lower: 13,
            upper: 13
        },
        "Hard to Kill": {
            cost: 2000,
            improved: "Harder to Kill",
            lower: 14,
            upper: 14
        },
        "Harder to Kill": {
            cost:4000,
            required:"Hard to Kill",
            lower: 0,
            upper: 0
        },
        "Marksman": {
            cost: 4000,
            lower: 15,
            upper: 15
        },
        "Nerves of Steel": {
            cost: 2000,
            lower: 16,
            upper: 17
        },
        "Quick": {
            cost: 2000,
            lower: 18,
            upper: 18
        },
        "Steady Hands": {
            cost: 2000,
            lower: 19,
            upper: 19
        },
        "Strong Willed": {
            cost: 2000,
            lower: 20,
            upper: 20
        }
    };

    processEdges(table4D_edgesObj, numEdges);
}

function table4E_powers(numPowers, artifactType) {
    var table4F_powersObj = {
        "armor": {
            rank: 'Novice',
            "Major Artifact": {
                withRaise: true,
                basePowerPoints: 2
            },
            group: 1,
            lower: 1,
            upper: 4
        },
        "barrier": {
            rank: 'Seasoned',
            "Major Artifact": {
                withRaise: false,
                basePowerPoints: 3,
            },
            group: 1,
            lower: 5,
            upper: 5
        },
        "beast friend": {
            rank: 'Novice',
            "Major Artifact": {
                withRaise: false,
                basePowerPoints: 3,
                effects: function() {
                    var size = d(11) - 1,
                        powerPoints = this.basePowerPoints + (2 * size),
                        powerEffect, swarmSize, swarmSizeResult, swarmSizesObj = {
                            "Small": {
                                lower: 3,
                                upper: 4
                            },
                            "Medium": {
                                lower: 5,
                                upper: 7
                            },
                            "Large": {
                                lower: 8,
                                upper: 23
                            }
                        };

                    for (swarmSize in swarmSizesObj) {
                        swarmSizeResult = swarmSizesObj[swarmSize];
                        if (powerPoints >= swarmSizeResult.lower && powerPoints <= swarmSizeResult.upper) {
                            powerEffect = 'max. creature size: +' + size + '; max. swarm size: ' + swarmSize;
                            break;
                        }
                    }

                    return [powerEffect, powerPoints];
                }
            },
            group: 1,
            lower: 6,
            upper: 6
        },
        "boost/lower trait": {
            rank: 'Novice',
            "Major Artifact": {
                withRaise: true,
                basePowerPoints: 2,
                effects: function() {
                    var powerEffect, trait, targets = d(6) - 1,
                        powerPoints = this.basePowerPoints + targets;

                    if (relicObj.name === 'pot helm' || relicObj.name === 'steel helmet') {
                        switch (d(2)) {
                            case 1:
                                trait = 'Smarts';
                                break;
                            case 2:
                                trait = 'Spirit';
                                break;
                        }
                    } else {
                        switch (d(3)) {
                            case 1:
                                trait = 'Agility';
                                break;
                            case 2:
                                trait = 'Strength';
                                break;
                            case 3:
                                trait = 'Vigor';
                                break;
                        }
                    }

                    if (targets === 0) {
                        powerEffect = trait + '; self only';
                    } else {
                        powerEffect = trait + '; max. ' + targets + ' additional targets';
                    }

                    return [powerEffect, powerPoints];
                }
            },
            group: 1,
            lower: 7,
            upper: 10
        },
        "burrow": {
            rank: 'Novice',
            "Major Artifact": {
                withRaise: true,
                basePowerPoints: 3,
                effects: function() {
                    var powerEffect, targets = d(6) - 1,
                        powerPoints = this.basePowerPoints + targets;

                    if (targets === 0) {
                        powerEffect = 'self only';
                    } else {
                        powerEffect = 'max. additional targets: ' + targets;
                    }
                    return [powerEffect, powerPoints];
                }
            },
            group: 2,
            lower: 1,
            upper: 1
        },
        "deflection": {
            rank: 'Novice',
            "Major Artifact": {
                withRaise: true,
                basePowerPoints: 2
            },
            group: 2,
            lower: 2,
            upper: 3
        },
        "detect/conceal arcana": {
            rank: 'Novice',
            "Major Artifact": {
                withRaise: false,
                basePowerPoints: 3,
            },
            group: 2,
            lower: 4,
            upper: 4
        },
        "dispel": {
            rank: 'Seasoned',
            "Major Artifact": {
                withRaise: false,
                basePowerPoints: 3,
            },
            group: 2,
            lower: 5,
            upper: 5
        },
        "elemental manipulation": {
            rank: 'Novice',
            "Major Artifact": {
                withRaise: false,
                basePowerPoints: 1,
            },
            group: 2,
            lower: 6,
            upper: 7
        },
        "entangle": {
            rank: 'Novice',
            "Major Artifact": {
                withRaise: true,
                basePowerPoints: 2 * d(2),
                effects: function() {
                    var powerEffect, powerPoints = this.basePowerPoints;

                    switch (powerPoints) {
                        case 2:
                            powerEffect = 'single target';
                            break;
                        case 4:
                            powerEffect = 'Medium Burst';
                            break;
                    }

                    return [powerEffect, powerPoints];
                }
            },
            group: 2,
            lower: 8,
            upper: 8
        },
        "environmental protection": {
            rank: 'Novice',
            "Major Artifact": {
                withRaise: true,
                basePowerPoints: 2,
                effects: function() {
                    var powerEffect, targets = d(6) - 1,
                        powerPoints = this.basePowerPoints + targets;

                    if (targets === 0) {
                        powerEffect = 'self only';
                    } else {
                        powerEffect = 'max. additional targets: ' + targets;
                    }

                    return [powerEffect, powerPoints];
                }
            },
            group: 2,
            lower: 9,
            upper: 10
        },
        "fear": {
            rank: 'Novice',
            "Major Artifact": {
                withRaise: true,
                basePowerPoints: 2
            },
            group: 3,
            lower: 1,
            upper: 1
        },
        "fly": {
            rank: 'Veteran',
            "Major Artifact": {
                withRaise: true,
                basePowerPoints: (3 * d(2)),
                effects: function() {
                    var powerEffect, targets = d(6) - 1,
                        powerPoints = this.basePowerPoints + targets;

                    if (targets === 0) {
                        switch (this.basePowerPoints) {
                            case 3:
                                powerEffect = 'Pace; Climb 0; self only';
                                break;
                            case 6:
                                powerEffect = 'Pace x2; Climb 0; self only';
                                break;
                        }
                    } else {
                        switch (this.basePowerPoints) {
                            case 3:
                                powerEffect = 'Pace; Climb 0; max. additional targets: ' + targets;
                                break;
                            case 6:
                                powerEffect = 'Pace x2; Climb 0; max. additional targets: ' + targets;
                                break;
                        }
                    }

                    return [powerEffect, powerPoints];
                }
            },
            group: 3,
            lower: 2,
            upper: 3
        },
        "invisibility": {
            rank: 'Seasoned',
            "Major Artifact": {
                withRaise: true,
                basePowerPoints: 5,
                effects: function() {
                    var powerEffect, targets = d(6) - 1,
                        powerPoints = this.basePowerPoints + targets;

                    if (targets === 0) {
                        powerEffect = 'self only';
                    } else {
                        powerEffect = 'max. additional targets: ' + targets;
                    }

                    return [powerEffect, powerPoints];
                }
            },
            group: 3,
            lower: 4,
            upper: 4
        },
        "light/obscure": {
            rank: 'Novice',
            "Major Artifact": {
                withRaise: false,
                basePowerPoints: 2
            },
            group: 3,
            lower: 5,
            upper: 8
        },
        "puppet":{
            rank: 'Veteran',
            "Major Artifact": {
                withRaise: false,
                basePowerPoints: 3,
            },
            group: 3,
            lower: 9,
            upper: 9

        },
        "quickness": {
            rank: 'Seasoned',
            "Major Artifact": {
                withRaise: true,
                basePowerPoints: 4
            },
            group: 3,
            lower: 10,
            upper: 10
        },
        "shape change": {
            rank: 'Legendary',
            "Major Artifact": {
                withRaise: false,
                basePowerPoints: 3,
                effects: function() {
                    var powerEffect, powerRank, powerPoints;

                    switch (d(5)) {
                        case 1:
                            powerRank = 'Novice';
                            powerPoints = 3;
                            break;
                        case 2:
                            powerRank = 'Seasoned';
                            powerPoints = 4;
                            break;
                        case 3:
                            powerRank = 'Veteran';
                            powerPoints = 5;
                            break;
                        case 4:
                            powerRank = 'Heroic';
                            powerPoints = 6;
                            break;
                        case 5:
                            powerRank = 'Legendary';
                            powerPoints = 7;
                            break;
                    }

                    powerEffect = powerRank + ' animal';

                    return [powerEffect, powerPoints, powerRank];
                }
            },
            group: 4,
            lower: 1,
            upper: 2
        },
        "smite": {
            rank: 'Novice',
            "Major Artifact": {
                withRaise: true,
                basePowerPoints: 2,
                effects: function() {
                    var powerEffect, targets = d(6) - 1,
                        powerPoints = this.basePowerPoints + targets;

                    if (targets === 0) {
                        powerEffect = 'fire trapping; self only';
                    } else {
                        powerEffect = 'fire trapping; max. additional targets: ' + targets;
                    }

                    return [powerEffect, powerPoints];
                }
            },
            group: 4,
            lower: 3,
            upper: 3
        },
        "speak language":{
            rank: 'Novice',
            "Major Artifact": {
                withRaise: true,
                basePowerPoints: 1,
            },
            group: 4,
            lower: 4,
            upper: 4

        },
        "speed": {
            rank: 'Novice',
            "Major Artifact": {
                withRaise: true,
                basePowerPoints: 1
            },
            group: 4,
            lower: 5,
            upper: 6
        },
        "telekinesis":{
            rank: 'Seasoned',
            "Major Artifact": {
                withRaise: true,
                basePowerPoints: 5,
            },
            group: 4,
            lower: 7,
            upper: 7

        },
        "teleport": {
            rank: 'Seasoned',
            "Major Artifact": {
                withRaise: true,
                basePowerPoints: 3
            },
            group: 4,
            lower: 8,
            upper: 9
        },
        "zombie":{
            rank: 'Veteran',
            "Major Artifact": {
                withRaise: true,
                basePowerPoints: 3,
            },
            group: 4,
            lower: 10,
            upper: 10
        }
    };
    processPowers(table4F_powersObj, numPowers, artifactType);
}

function table4F_namedItems() {

    var table, result, table4F_namedItemsObj = {
            "Clothing 1": {
                roll: function(){
                    table4G_clothing1();
                },
                lower: 1,
                upper: 2
            },
            "Clothing 2": {
                roll: function(){
                    table4H_clothing2();
                },
                lower: 3,
                upper: 4
            },
            "Clothing 3": {
                roll: function(){
                    table4I_clothing3();
                },
                lower: 5,
                upper: 6
            },
            "Clothing 4": {
                roll: function(){
                    table4J_clothing4();
                },
                lower: 7,
                upper: 8
            },
            "Clothing 5": {
                roll: function(){
                    table4K_clothing5();
                },
                lower: 9,
                upper: 10
            },
            "Jewelry 1": {
                roll: function(){
                    table4L_jewelry1();
                },
                lower: 11,
                upper: 11
            },
            "Jewelry 2": {
                roll: function(){
                    table4M_jewelry2();
                },
                lower: 12,
                upper: 12
            },
            "Miscellaneous 1": {
                roll: function(){
                    table4N_miscellaneous1();
                },
                lower: 13,
                upper: 14
            },
            "Miscellaneous 2": {
                roll: function(){
                    table4O_miscellaneous2();
                },
                lower: 15,
                upper: 16
            },
            "Miscellaneous 3": {
                roll: function(){
                    table4P_miscellaneous3();
                },
                lower: 17,
                upper: 18
            },
            "Miscellaneous 4": {
                roll: function(){
                    table4Q_miscellaneous4();
                },
                lower: 19,
                upper: 20
            }
        };

    dieRoll = d(20);
    for (table in table4F_namedItemsObj) {
        result = table4F_namedItemsObj[table];
        if (dieRoll >= result.lower && dieRoll <= result.upper) {
            result.roll();
            break;
        }
    }
}

function table4G_clothing1(){
    var item, result, table4G_clothing1Obj = {
        "Armbands of Strength":{
            cost: 5000,
            page: 61,
            lower: 1,
            upper: 2
        },
        "Bearskin Cloak":{
            cost: 1500,
            page: 62,
            lower: 3,
            upper: 4
        },
        "Belt of Strength":{
            cost: 7000,
            page: 63,
            lower: 5,
            upper: 5
        },
        "Boots of Speed":{
            cost: 3000,
            page: 63,
            lower: 6,
            upper: 7
        },
        "Bracers of Agility":{
            cost: 7000,
            page: 64,
            lower: 8,
            upper: 8
        },
        "Bracers of the Mule":{
            cost: 1000,
            page: 64,
            lower: 9,
            upper: 11
        },
        "Cap of Discernment":{
            cost: 3500,
            page: 65,
            lower: 12,
            upper: 12
        },
        "Cap of Concentration":{
            cost: 6000,
            page: 65,
            lower: 13,
            upper: 14
        },
        "Cap of Concentration, Greater":{
            cost: 8000,
            page: 65,
            lower: 15,
            upper: 15
        },
        "Cap of Tongues":{
            cost: 3000,
            page: 65,
            lower: 16,
            upper: 16
        },
        "Cloak of Bridging":{
            cost: 6500,
            page: 65,
            lower: 17,
            upper: 17
        },
        "Cloak of Darkness":{
            cost: 2000,
            page: 66,
            lower: 18,
            upper: 19
        },
        "Cloak of Dragonscales":{
            cost: 1500,
            page: 66,
            lower: 20,
            upper: 20
        }
    };
    
    dieRoll = d(20);
    for (item in table4G_clothing1Obj) {
        result = table4G_clothing1Obj[item];
        if (dieRoll >= result.lower && dieRoll <= result.upper) {
            relicObj.name = item;
            relicObj.cost = result.cost;
            relicObj.page = result.page;
            break;
        }
    }
}

function table4H_clothing2(){
    var item, result, table4H_clothing2Obj = {
        "Cloak of Etherealness":{
            cost: 9000,
            page: 66,
            lower: 1,
            upper: 1
        },
        "Cloak of Invisibility":{
            cost: 12000,
            page: 66,
            lower: 2,
            upper: 3
        },
        "Cloak of Invisibility, Greater":{
            cost: 17000,
            page: 66,
            lower: 4,
            upper: 4
        },
        "Cloak of Protection":{
            cost: 5000,
            page: 66,
            lower: 5,
            upper: 7
        },
        "Cloak of Protection, Greater":{
            cost: 7000,
            page: 66,
            lower: 8,
            upper: 8
        },
        "Cloak of Regal Bearing":{
            cost: 2000,
            page: 66,
            lower: 9,
            upper: 10
        },
        "Cloak of Shadows":{
            cost: 5000,
            page: 66,
            lower: 11,
            upper: 12
        },
        "Cloak of Shadows, Greater":{
            cost: 7000,
            page: 66,
            lower: 13,
            upper: 13
        },
        "Cloak of Teleportation":{
            cost: 5900,
            page: 66,
            lower: 14,
            upper: 14
        },
        "Cloak of the (Animal)":{
            cost: 13500,
            page: 67,
            lower: 15,
            upper: 16
        },
        "Cloak of the Small Folk":{
            cost: 5500,
            page: 68,
            lower: 17,
            upper: 17
        },
        "Courtier's Robes":{
            cost: "Var",
            page: 68,
            lower: 18,
            upper: 19
        },
        "Elf Goggles":{
            cost: 2000,
            page: 69,
            lower: 20,
            upper: 20
        }
    };
    dieRoll = d(20);
    for (item in table4H_clothing2Obj) {
        result = table4H_clothing2Obj[item];
        if (dieRoll >= result.lower && dieRoll <= result.upper) {
            relicObj.name = item;
            relicObj.cost = result.cost;
            relicObj.page = result.page;
            break;
        }
    }
}

function table4I_clothing3(){
    var item, result, table4I_clothing3Obj = {
        "Elven Gloves":{
            cost: "Var",
            page: 69,
            lower: 1,
            upper: 3
        },
        "Executioner's Hood":{
            cost: "Var",
            page: 70,
            lower: 4,
            upper: 5
        },
        "Gauntlet of Poltergeists":{
            cost: 6500,
            page: 70,
            lower: 6,
            upper: 6
        },
        "Giantskin Cloak":{
            cost: 5500,
            page: 71,
            lower: 7,
            upper: 8
        },
        "Girdle of Endurance":{
            cost: 7000,
            page: 71,
            lower: 9,
            upper: 9
        },
        "Glasses of Rapid Reading":{
            cost: "Var",
            page: 71,
            lower: 10,
            upper: 11
        },
        "Gloves of Fighting":{
            cost: "Var",
            page: 71,
            lower: 12,
            upper: 13
        },
        "Goblin Goggles":{
            cost: 2000,
            page: 72,
            lower: 14,
            upper: 14
        },
        "Goggles of Revealing":{
            cost: 5000,
            page: 72,
            lower: 15,
            upper: 16
        },
        "Goggles of the Eagle":{
            cost: 5000,
            page: 72,
            lower: 17,
            upper: 17
        },
        "Goggles of Translation":{
            cost: 4000,
            page: 72,
            lower: 18,
            upper: 18
        },
        "Headband of Action":{
            cost: 4000,
            page: 72,
            lower: 19,
            upper: 20
        }        
    };
    dieRoll = d(20);
    for (item in table4I_clothing3Obj) {
        result = table4I_clothing3Obj[item];
        if (dieRoll >= result.lower && dieRoll <= result.upper) {
            relicObj.name = item;
            relicObj.cost = result.cost;
            relicObj.page = result.page;
            break;
        }
    }
}

function table4J_clothing4(){
    var item, result, table4J_clothing4Obj = {
        "Headband of Action, Greater":{
            cost: 8000,
            page: 72,
            lower: 1,
            upper: 1
        },
        "Headband of Intelligence":{
            cost: 4000,
            page: 72,
            lower: 2,
            upper: 3
        },
        "Headband of Command":{
            cost: 2000,
            page: 72,
            lower: 4,
            upper: 5
        },
        "Jester's Hat":{
            cost: "Var",
            page: 73,
            lower: 6,
            upper: 7
        },
        "Left Handed Glove":{
            cost: 2000,
            page: 73,
            lower: 8,
            upper: 9
        },
        "Mariner's Shoes":{
            cost: 2000,
            page: 74,
            lower: 10,
            upper: 11
        },
        "Mask of Beauty":{
            cost: 2000,
            page: 74,
            lower: 12,
            upper: 13
        },
        "Mask of Beauty, Greater":{
            cost: 4000,
            page: 74,
            lower: 14,
            upper: 14
        },
        "Mask of the Mermaid":{
            cost: 1500,
            page: 74,
            lower: 15,
            upper: 16
        },
        "Peacemaker's Gloves":{
            cost: 5500,
            page: 74,
            lower: 17,
            upper: 17
        },
        "Purse of Unlimited Wealth":{
            cost: 1000,
            page: 75,
            lower: 18,
            upper: 18
        },
        "Rabbitskin Boots":{
            cost: 5000,
            page: 75,
            lower: 19,
            upper: 19
        },
        "Salamander Gloves":{
            cost: 3500,
            page: 76,
            lower: 20,
            upper: 20
        }
    };

    dieRoll = d(20);
    for (item in table4J_clothing4Obj) {
        result = table4J_clothing4Obj[item];
        if (dieRoll >= result.lower && dieRoll <= result.upper) {
            relicObj.name = item;
            relicObj.cost = result.cost;
            relicObj.page = result.page;
            break;
        }
    }
}

function table4K_clothing5(){
    var item, result, table4K_clothing5Obj = {
        "Skirt of the Dervish":{
            cost: 5500,
            page: 76,
            lower: 1,
            upper: 2
        },
        "Skull Mask":{
            cost: 4500,
            page: 76,
            lower: 3,
            upper: 4
        },
        "Skullcap of Intellect":{
            cost: 7000,
            page: 76,
            lower: 5,
            upper: 5
        },
        "Slaver's Shackles":{
            cost: 11000,
            page: 76,
            lower: 6,
            upper: 7
        },
        "Snakeskin Gloves":{
            cost: 2000,
            lower: 8,
            page: 77,
            upper: 9
        },
        "Spider Boots":{
            cost: 4000,
            page: 77,
            lower: 10,
            upper: 11
        },
        "Spiderweb Mask":{
            cost: 4500,
            page: 77,
            lower: 12,
            upper: 13
        },
        "Swordsman's Scabbard":{
            cost: 2000,
            page: 77,
            lower: 14,
            upper: 15
        },
        "Tabard of the Holy Warrior":{
            cost: 2000,
            page: 77,
            lower: 16,
            upper: 16
        },
        "Viper Tooth Gloves":{
            cost: 6500,
            page: 77,
            lower: 17,
            upper: 18
        },
        "Wolfskin Boots":{
            cost: 2000,
            page: 78,
            lower: 19,
            upper: 20
        }
    };

    dieRoll = d(20);
    for (item in table4K_clothing5Obj) {
        result = table4K_clothing5Obj[item];
        if (dieRoll >= result.lower && dieRoll <= result.upper) {
            relicObj.name = item;
            relicObj.cost = result.cost;
            relicObj.page = result.page;
            break;
        }
    }
}

function table4L_jewelry1(){
    var item, result, table4L_jewelry1Obj = {
        "Anklet of Agility":{
            cost: 5500,
            page: 61,
            lower: 1,
            upper: 2
        },
        "Beads of Knolwedge":{
            cost: "Var",
            page: 62,
            lower: 3,
            upper: 5
        },
        "Bracelet of Cats' Whiskers":{
            cost: 4000,
            page: 64,
            lower: 6,
            upper: 7
        },
        "Bracelet of Danger Sense":{
            cost: 2000,
            page: 64,
            lower: 8,
            upper: 9
        },
        "Brooch of Confidence":{
            cost: 5000,
            page: 64,
            lower: 10,
            upper: 11
        },
        "Brooch of Fitness":{
            cost: 5000,
            page: 64,
            lower: 12,
            upper: 13
        },
        "Brooch of Gems":{
            cost: 50,
            page: 64,
            lower: 14,
            upper: 16
        },
        "Brooch of Rapid Recovery":{
            cost: 2000,
            page: 64,
            lower: 17,
            upper: 18
        },
        "Brooch of Resistance":{
            cost: 2000,
            page: 64,
            lower: 19,
            upper: 20
        }
    };

    dieRoll = d(20);
    for (item in table4L_jewelry1Obj) {
        result = table4L_jewelry1Obj[item];
        if (dieRoll >= result.lower && dieRoll <= result.upper) {
            relicObj.name = item;
            relicObj.cost = result.cost;
            relicObj.page = result.page;
            break;
        }
    }
}

function table4M_jewelry2(){
    var item, result, table4M_jewelry2Obj = {
        "Brooch of Resistance, Greater":{
            cost: 4000,
            page: 64,
            lower: 1,
            upper: 1
        },
        "Bull's Eye Pendant":{
            cost: "Var",
            page: 64,
            lower: 2,
            upper: 4
        },
        "Charm of the Warrior":{
            cost: 4000,
            page: 65,
            lower: 5,
            upper: 7
        },
        "Medal of Honor":{
            cost: "Var",
            page: 74,
            lower: 8,
            upper: 10
        },
        "Necklace of Ears":{
            cost: "Var",
            page: 74,
            lower: 11,
            upper: 12
        },
        "Pendant of the Wolf":{
            cost: "Var",
            page: 75,
            lower: 13,
            upper: 14
        },
        "Ranger Badge":{
            cost: "Var",
            page: 75,
            lower: 15,
            upper: 15
        },
        "Spinning Pendant":{
            cost: 6500,
            page: 77,
            lower: 16,
            upper: 16
        },
        "Torc of Authority":{
            cost: 7000,
            page: 78,
            lower: 17,
            upper: 17
        },
        "Stone of Boosting":{
            cost: "Var",
            page: 75,
            lower: 18,
            upper: 20
        }
    };
    dieRoll = d(20);
    for (item in table4M_jewelry2Obj) {
        result = table4M_jewelry2Obj[item];
        if (dieRoll >= result.lower && dieRoll <= result.upper) {
            relicObj.name = item;
            relicObj.cost = result.cost;
            relicObj.page = result.page;
            break;
        }
    }
}

function table4N_miscellaneous1(){
    var item, result, table4N_miscellaneous1Obj = {
        "Adventurer's Tinderbox":{
            cost: 2900,
            page: 61,
            lower: 1,
            upper: 2
        },
        "Adventurer's Torch":{
            cost: 3000,
            page: 61,
            lower: 3,
            upper: 4
        },
        "Bag of Fog":{
            cost: 5000,
            page: 61,
            lower: 5,
            upper: 5
        },
        "Bag of Marbles":{
            cost: 4500,
            page: 62,
            lower: 6,
            upper: 6
        },
        "Barrier Staves":{
            cost: 4000,
            page: 62,
            lower: 7,
            upper: 7
        },
        "Battlefield Map":{
            cost: "Var",
            page: 62,
            lower: 8,
            upper: 8
        },
        "Bear's Tooth":{
            cost: 300,
            page: 62,
            lower: 9,
            upper: 10
        },
        "Beggar's Bone":{
            cost: 4000,
            page: 62,
            lower: 11,
            upper: 12
        },
        "Bell of Turning":{
            cost: 5500,
            page: 63,
            lower: 13,
            upper: 13
        },
        "Blood Banner":{
            cost: 8000,
            page: 63,
            lower: 14,
            upper: 14
        },
        "Book of Riddles":{
            cost: 5500,
            page: 63,
            lower: 15,
            upper: 15
        },
        "Captain's Plume":{
            cost: 6000,
            page: 65,
            lower: 16,
            upper: 17
        },
        "Chalk of Spirit Warding":{
            cost: 100,
            page: 65,
            lower: 18,
            upper: 18
        },
        "Circlets of Safe Return":{
            cost: 7500,
            page: 65,
            lower: 19,
            upper: 19
        },
        "Coachman's Whip":{
            cost: "Var",
            page: 68,
            lower: 20,
            upper: 20
        }
    };
    dieRoll = d(20);
    for (item in table4N_miscellaneous1Obj) {
        result = table4N_miscellaneous1Obj[item];
        if (dieRoll >= result.lower && dieRoll <= result.upper) {
            relicObj.name = item;
            relicObj.cost = result.cost;
            relicObj.page = result.page;
            break;
        }
    }
}

function table4O_miscellaneous2(){
    var item, result, table4O_miscellaneous2Obj = {
        "Collar of Faithfulness":{
            cost: 2000,
            page: 68,
            lower: 1,
            upper: 1
        },
        "Collar of Obedience":{
            cost: 2000,
            page: 68,
            lower: 2,
            upper: 2
        },
        "Crook of the Tomb Guard":{
            cost: 5500,
            page: 68,
            lower: 3,
            upper: 3
        },
        "Crystal Ball":{
            cost: 6300,
            page: 68,
            lower: 4,
            upper: 4
        },
        "Doppelganger Prism":{
            cost: 5500,
            page: 69,
            lower: 5,
            upper: 5
        },
        "Dragon's Tooth":{
            cost: 75,
            page: 69,
            lower: 6,
            upper: 8
        },
        "Dust of Levitation":{
            cost: 125,
            page: 69,
            lower: 9,
            upper: 11
        },
        "Dust of Reanimation":{
            cost: 250,
            page: 69,
            lower: 12,
            upper: 12
        },
        "Exploding Stones":{
            cost: 300,
            page: 70,
            lower: 13,
            upper: 14
        },
        "Flash Pellets":{
            cost: 100,
            page: 70,
            lower: 15,
            upper: 16
        },
        "Flute of the Shepherd":{
            cost: 4500,
            page: 70,
            lower: 17,
            upper: 17
        },
        "Flying Carpet":{
            cost: 12000,
            page: 70,
            lower: 18,
            upper: 19
        },
        "Gem of Desire":{
            cost: 6100,
            page: 71,
            lower: 20,
            upper: 20
        }
    };

    dieRoll = d(20);
    for (item in table4O_miscellaneous2Obj) {
        result = table4O_miscellaneous2Obj[item];
        if (dieRoll >= result.lower && dieRoll <= result.upper) {
            relicObj.name = item;
            relicObj.cost = result.cost;
            relicObj.page = result.page;
            break;
        }
    }
}

function table4P_miscellaneous3(){
    var item, result, table4P_miscellaneous3Obj = {
        "Gem of Elementals (Air)":{
            cost: 250,
            page: 71,
            lower: 1,
            upper: 1
        },
        "Gem of Elementals (Earth)":{
            cost: 250,
            page: 71,
            lower: 2,
            upper: 2
        },
        "Gem of Elementals (Fire)":{
            cost: 250,
            page: 71,
            lower: 3,
            upper: 3
        },
        "Gem of Elementals (Water)":{
            cost: 250,
            page: 71,
            lower: 4,
            upper: 4
        },
        "Gossip's Coin":{
            cost: "Var",
            page: 72,
            lower: 5,
            upper: 6
        },
        "Grave Dust":{
            cost: 150,
            page: 72,
            lower: 7,
            upper: 7
        },
        "Hero's Banner":{
            cost: 7000,
            page: 72,
            lower: 8,
            upper: 8
        },
        "Horn of Bellowing":{
            cost: 6500,
            page: 72,
            lower: 9,
            upper: 9
        },
        "Horn of Heroes":{
            cost: 4000,
            page: 73,
            lower: 10,
            upper: 10
        },
        "Lamp of the Elementals":{
            cost: 6500,
            page: 73,
            lower: 11,
            upper: 11
        },
        "Mage's Key":{
            cost: 5000,
            page: 73,
            lower: 12,
            upper: 12
        },
        "Magical Map":{
            cost: 4500,
            page: 73,
            lower: 13,
            upper: 13
        },
        "Mana Stone":{
            cost: "$1,000/PP",
            page: 74,
            lower: 14,
            upper: 16
        },
        "Manual of the Wilds":{
            cost: "Var",
            page: 74,
            lower: 17,
            upper: 18
        },
        "Mariner's Sextant":{
            cost: "Var",
            page: 74,
            lower: 19,
            upper: 19
        },
        "Picks of the Master Thief":{
            cost: 7000,
            page: 75,
            lower: 20,
            upper: 20
        }
    };
    dieRoll = d(20);
    for (item in table4P_miscellaneous3Obj) {
        result = table4P_miscellaneous3Obj[item];
        if (dieRoll >= result.lower && dieRoll <= result.upper) {
            relicObj.name = item;
            relicObj.cost = result.cost;
            relicObj.page = result.page;
            break;
        }
    }
}

function table4Q_miscellaneous4(){
    var item, result, table4Q_miscellaneous4Obj = {
        "Pipes of Peaceful Rest":{
            cost: 5500,
            page: 75,
            lower: 1,
            upper: 1
        },
        "Pocket Bestiary":{
            cost: "Var",
            page: 75,
            lower: 2,
            upper: 3
        },
        "Rabbit's Foot":{
            cost: 2000,
            page: 75,
            lower: 4,
            upper: 5
        },
        "Rabbit's Foot, Greater":{
            cost: 4000,
            page: 75,
            lower: 6,
            upper: 6
        },
        "Rope of Climbing":{
            cost: "Var",
            page: 75,
            lower: 7,
            upper: 8
        },
        "Roving Rat":{
            cost: 4500,
            page: 75,
            lower: 9,
            upper: 9
        },
        "Sentry Orb":{
            cost: 5500,
            page: 76,
            lower: 10,
            upper: 10
        },
        "Smoke Pellets":{
            cost: 100,
            page: 76,
            lower: 11,
            upper: 13
        },
        "Spade of Tunneling":{
            cost: 7000,
            page: 77,
            lower: 14,
            upper: 14
        },
        "Standard of the Forlorn Hope":{
            cost: 6000,
            page: 78,
            lower: 15,
            upper: 15
        },
        "Staff of Warding":{
            cost: 19000,
            page: 78,
            lower: 16,
            upper: 16
        },
        "Thieves' Picks":{
            cost: "Var",
            page: 79,
            lower: 17,
            upper: 18
        },
        "Window Chalk":{
            cost: 150,
            page: 78,
            lower: 19,
            upper: 19
        },
        "Witch's Broom":{
            cost: 18000,
            page: 79,
            lower: 20,
            upper: 20
        }
    };

    dieRoll = d(20);
    for (item in table4Q_miscellaneous4Obj) {
        result = table4Q_miscellaneous4Obj[item];
        if (dieRoll >= result.lower && dieRoll <= result.upper) {
            relicObj.name = item;
            relicObj.cost = result.cost;
            relicObj.page = result.page;
            break;
        }
    }
}

//Table 5: Potions
function table5_potions(){
    var result, potion, table5_potionsObj = {
        potion1: {
            power: "armor",
            withRaise: false,
            cost: 450,
            group: 1,
            lower: 1,
            upper: 3
        },
        potion2: {
            power: "armor",
            withRaise: true,
            cost: 675,
            group: 1,
            lower: 4,
            upper: 5
        },
        potion3: {
            power: "boost Agility",
            withRaise: false,
            cost: 450,
            group: 1,
            lower: 6,
            upper: 6
        },
        potion4: {
            power: "boost Agility",
            withRaise: true,
            cost: 675,
            group: 1,
            lower: 7,
            upper: 7
        },
        potion5: {
            power: "boost Smarts",
            withRaise: false,
            cost: 450,
            group: 1,
            lower: 8,
            upper: 9
        },
        potion6: {
            power: "boost Smarts",
            withRaise: true,
            cost: 675,
            group: 1,
            lower: 10,
            upper: 10
        },
        potion7: {
            power: "boost Spirit",
            withRaise: false,
            cost: 450,
            group: 2,
            lower: 1,
            upper: 2
        },
        potion8: {
            power: "boost Spirit",
            withRaise: true,
            cost: 675,
            group: 2,
            lower: 3,
            upper: 3
        },
        potion9: {
            power: "boost Strength",
            withRaise: false,
            cost: 450,
            group: 2,
            lower: 4,
            upper: 5
        },
        potion10: {
            power: "boost Strength",
            withRaise: true,
            cost: 675,
            group: 2,
            lower: 6,
            upper: 6
        },
        potion11: {
            power: "boost Vigor",
            withRaise: false,
            cost: 450,
            group: 2,
            lower: 7,
            upper: 8
        },
        potion12: {
            power: "boost Vigor",
            withRaise: true,
            cost: 675,
            group: 2,
            lower: 9,
            upper: 9
        },
        potion13: {
            power: "boost skill",
            withRaise: false,
            effect: "GM's choice",
            cost: 450,
            group: 2,
            lower: 10,
            upper: 10
        },
        potion14: {
            power: "boost skill",
            withRaise: true,
            effect: "GM's choice",
            cost: 675,
            group: 3,
            lower: 1,
            upper: 1
        },
        potion15: {
            power: "detect arcana",
            withRaise: false,
            cost: 100,
            group: 3,
            lower: 2,
            upper: 2
        },
        potion16: {
            power: "environmental protection",
            withRaise: false,
            effect: "cold",
            cost: 550,
            group: 3,
            lower: 3,
            upper: 3
        },
        potion17: {
            power: "environmental protection",
            withRaise: false,
            effect: "heat",
            cost: 550,
            group: 3,
            lower: 4,
            upper: 4
        },
        potion18: {
            power: "environmental protection",
            withRaise: false,
            effect: "water",
            cost: 550,
            group: 3,
            lower: 5,
            upper: 5
        },
        potion19: {
            power: "fly",
            withRaise: false,
            effect: "Pace 6\"",
            cost: 500,
            group: 3,
            lower: 6,
            upper: 6
        },
        potion20: {
            power: "fly",
            withRaise: false,
            effect: "Pace 12\"",
            cost: 650,
            group: 3,
            lower: 7,
            upper: 7
        },
        potion21: {
            power: "greater healing",
            withRaise:false,
            effect: "wounds only",
            cost: 500,
            group: 3,
            lower: 8,
            upper: 9
        },
         potion22: {
            power: "greater healing",
            withRaise: false,
            effect: "injuries or wounds",
            cost: 1000,
            group: 3,
            lower: 10,
            upper: 10
        },
         potion23: {
            power: "healing",
            withRaise: false,
            cost: 150,
            group: 4,
            lower: 1,
            upper: 4
        },
         potion24: {
            power: "healing",
            withRaise: true,
            cost: 225,
            group: 4,
            lower: 5,
            upper: 6
        },
         potion25: {
            power: "invisibility",
            withRaise: false,
            cost: 700,
            group: 4,
            lower: 7,
            upper: 8
        },
         potion26: {
            power: "invisibility",
            withRaise: true,
            cost: 1050,
            group: 4,
            lower: 9,
            upper: 9
        },
         potion27: {
            power: "puppet",
            withRaise: false,
            cost: 550,
            group: 4,
            lower: 10,
            upper: 10
        },
         potion28: {
            power: "quickness",
            withRaise: false,
            cost: 900,
            group: 5,
            lower: 1,
            upper: 2
        },
         potion29: {
            power: "quickness",
            withRaise: true,
            cost: 1350,
            group: 5,
            lower: 3,
            upper: 3
        },
         potion30: {
            power: "shape change",
            withRaise: false,
            effect: "Novice",
            cost: 600,
            group: 5,
            lower: 4,
            upper: 5
        },
         potion31: {
            power: "shape change",
            withRaise: false,
            effect: "Seasoned",
            cost: 650,
            group: 5,
            lower: 6,
            upper: 7
        },
         potion32: {
            power: "shape change",
            withRaise: false,
            effect: "Veteran",
            cost: 700,
            group: 5,
            lower: 8,
            upper: 8
        },
         potion33: {
            power: "shape change",
            withRaise: false,
            effect: "Heroic",
            cost: 750,
            group: 5,
            lower: 9,
            upper: 9
        },
         potion34: {
            power: "shape change",
            withRaise: false,
            effect: "Legendary",
            cost: 800,
            group: 5,
            lower: 10,
            upper: 10
        },
         potion35: {
            power: "speak language",
            withRaise: false,
            cost: 500,
            group: 6,
            lower: 1,
            upper: 2
        },
         potion36: {
            power: "speed",
            withRaise: false,
            cost: 400,
            group: 6,
            lower: 3,
            upper: 5
        },
         potion37: {
            power: "speed",
            withRaise: true,
            cost: 600,
            group: 6,
            lower: 6,
            upper: 8
        },
         potion38: {
            power: "telekinesis",
            withRaise: false,
            cost: 700,
            group: 6,
            lower: 9,
            upper: 9
        },
         potion39: {
            power: "teleport",
            withRaise: false,
            effect: "10\" range",
            cost: 150,
            group: 6,
            lower: 10,
            upper: 10
        }
     };


    groupRoll = d(6);
    dieRoll = d(10);

    for (potion in table5_potionsObj) {
        result = table5_potionsObj[potion];
        if (groupRoll === result.group && dieRoll >= result.lower && dieRoll <= result.upper){
            relicObj.name = 'Potion';
            relicObj.potion = {};
            relicObj.potion.power = result.power;
            relicObj.potion.withRaise = result.withRaise;
            if (result.effect !== undefined) {
                relicObj.potion.effect = result.effect;
            }
            relicObj.cost = result.cost;
            break;
        }
    }
}

//Table 6: Rings
function table6_rings() {

    var table, result, table6_ringsObj = {
            "Lesser Rings 1": {
                roll: function(){
                    table6A_lesserRings1();
                },
                lower: 1,
                upper: 6
            },
            "Lesser Rings 2": {
                roll: function(){
                    table6B_lesserRings2();
                },
                lower: 7,
                upper: 12
            },
            "Lesser Rings 3": {
                roll: function(){
                    table6C_lesserRings3();
                },
                lower: 13,
                upper: 18
            },
            "Greater Rings": {
                roll: function(){
                    table6D_greaterRings();
                },
                lower: 19,
                upper: 20
            }
        };

    dieRoll = d(20);
    for (table in table6_ringsObj) {
        result = table6_ringsObj[table];
        if (dieRoll >= result.lower && dieRoll <= result.upper) {
            result.roll();
            break;
        }
    }
}

function table6A_lesserRings1(){
    var ring, result, table6A_lesserRings1Obj = {
        "Arcane Resistance":{
            cost: 2000,
            page: 80,
            lower: 1,
            upper: 3
        },
        "Arcane Resistance, Greater":{
            cost: 4000,
            page: 80,
            lower: 4,
            upper: 5
        },
        "Archer":{
            cost: 4000,
            page: 80,
            lower: 6,
            upper: 7
        },
        "Avoidance":{
            cost: 4000,
            page: 80,
            lower: 8,
            upper: 9
        },
        "Avoidance, Greater":{
            cost: 10000,
            page: 80,
            lower: 10,
            upper: 10
        },
        "Bonding":{
            cost: 2000,
            page: 81,
            lower: 11,
            upper: 13
        },
        "Brawn":{
            cost: 2000,
            page: 81,
            lower: 14,
            upper: 14
        },
        "Dampening":{
            cost: 6000,
            page: 81,
            lower: 15,
            upper: 16
        },
        "Elemental Manipulation, Air":{
            cost: 4000,
            page: 81,
            lower: 17,
            upper: 18
        },
        "Elemental Manipulation, Earth":{
            cost: 4000,
            page: 81,
            lower: 19,
            upper: 20
        }
    };
    
    dieRoll = d(20);
    for (ring in table6A_lesserRings1Obj) {
        result = table6A_lesserRings1Obj[ring];
        if (dieRoll >= result.lower && dieRoll <= result.upper) {
            relicObj.name = 'Ring: ' + ring;
            relicObj.cost = result.cost;
            relicObj.page = result.page;
            break;
        }
    }
}

function table6B_lesserRings2(){
    var ring, result, table6B_lesserRings2Obj = {
        "Elemental Manipulation, Fire":{
            cost: 4000,
            page: 81,
            lower: 1,
            upper: 2
        },
        "Elemental Manipulation, Water":{
            cost: 4000,
            page: 81,
            lower: 3,
            upper: 4
        },
        "Fire Protection":{
            cost: 6000,
            page: 81,
            lower: 5,
            upper: 6
        },
        "Force":{
            cost: 4500,
            page: 81,
            lower: 7,
            upper: 8
        },
        "Hammerhand":{
            cost: 7000,
            page: 81,
            lower: 9,
            upper: 10
        },
        "Healing":{
            cost: 4500,
            page: 81,
            lower: 11,
            upper: 12
        },
        "Light":{
            cost: 4000,
            page: 82,
            lower: 13,
            upper: 15
        },
        "Magical Warding (Magic)":{
            cost: 5500,
            page: 82,
            lower: 16,
            upper: 17
        },
        "Magical Warding (Miracles)":{
            cost: 5500,
            page: 82,
            lower: 18,
            upper: 18
        },
        "Pain Resistance":{
            cost: 2000,
            page: 82,
            lower: 19,
            upper: 20
        }
    };
    
    dieRoll = d(20);
    for (ring in table6B_lesserRings2Obj) {
        result = table6B_lesserRings2Obj[ring];
        if (dieRoll >= result.lower && dieRoll <= result.upper) {
            relicObj.name = 'Ring: ' + ring;
            relicObj.cost = result.cost;
            relicObj.page = result.page;
            break;
        }
    }
}

function table6C_lesserRings3(){
    var ring, result, table6C_lesserRings3Obj = {
        "Pain Resistance, Greater":{
            cost: 4000,
            page: 82,
            lower: 1,
            upper: 1
        },
        "Power Surge":{
            cost: 4000,
            page: 82,
            lower: 2,
            upper: 3
        },
        "Protection":{
            cost: 5000,
            page: 82,
            lower: 4,
            upper: 7
        },
        "Protection, Greater":{
            cost: 7000,
            page: 82,
            lower: 8,
            upper: 9
        },
        "Rapid Recharge":{
            cost: 4000,
            page: 82,
            lower: 10,
            upper: 11
        },
        "Second Hand":{
            cost: 2000,
            page: 82,
            lower: 12,
            upper: 12
        },
        "Shielding":{
            cost: 4500,
            page: 83,
            lower: 13,
            upper: 13
        },
        "Storing":{
            cost: 2000,
            page: 83,
            lower: 14,
            upper: 17
        },
        "Swordsman":{
            cost: 2000,
            page: 83,
            lower: 18,
            upper: 18
        },
        "Water Walking":{
            cost: 4000,
            page: 83,
            lower: 19,
            upper: 20
        }
    };

    dieRoll = d(20);
    for (ring in table6C_lesserRings3Obj) {
        result = table6C_lesserRings3Obj[ring];
        if (dieRoll >= result.lower && dieRoll <= result.upper) {
            relicObj.name = 'Ring: ' + ring;
            relicObj.cost = result.cost;
            relicObj.page = result.page;
            break;
        }
    }
}

function table6D_greaterRings(){
    var ring, result, table6D_greaterRingsObj = {
        "Invisibility":{
            cost: 13000,
            page: 81,
            lower: 1,
            upper: 6
        },
        "Invisibility, Greater":{
            cost: 17000,
            page: 82,
            lower: 7,
            upper: 8
        },
        "Mastery":{
            cost: 10000,
            page: 82,
            lower: 9,
            upper: 14
        },
        "Rapid Recharge, Greater":{
            cost: 10000,
            page: 82,
            lower: 15,
            upper: 16
        },
        "Teleportation":{
            cost: 11000,
            page: 83,
            lower: 17,
            upper: 18
        },
        "Tome Control":{
            cost: 10000,
            page: 83,
            lower: 19,
            upper: 20
        }
    };

    dieRoll = d(20);
    for (ring in table6D_greaterRingsObj) {
        result = table6D_greaterRingsObj[ring];
        if (dieRoll >= result.lower && dieRoll <= result.upper) {
            relicObj.name = 'Ring: ' + ring;
            relicObj.cost = result.cost;
            relicObj.page = result.page;
            break;
        }
    }
}

//Table 7: Scrolls
function table7_scrolls(){
    relicObj.name = 'Scroll';
    relicObj.scroll = {};
    table7A_arcaneType();
    table7B_powers();
}

function table7A_arcaneType(){
    var arcaneType, result, table7A_arcaneTypeObj = {
        "Arcane Background (Magic)": {
            lower: 1,
            upper: 13
        },
        "Arcane Background (Miracles)": {
            lower: 14,
            upper: 20
        }
    };

    dieRoll = d(20);
    for (arcaneType in table7A_arcaneTypeObj) {
        result = table7A_arcaneTypeObj[arcaneType];
        if (dieRoll >= result.lower && dieRoll <= result.upper) {
            relicObj.scroll.arcaneType = arcaneType;
            break;
        }
    }
}

function table7B_powers(){
    var power, result, table7B_powersObj = {
        "armor": {
            pp: 9,
            cost: 450,
            rank: 'Novice',
            group: 1,
            lower: 1,
            upper: 4
        },
        "barrier": {
            pp: 10,
            cost: 500,
            rank: 'Seasoned',
            group: 1,
            lower: 5,
            upper: 6
        },
        "beast friend": {
            pp: 20,
            cost: 1000,
            rank: 'Novice',
            group: 1,
            lower: 7,
            upper: 7
        },
        "blast": {
            pp: 6,
            cost: 300,
            rank: 'Seasoned',
            group: 1,
            lower: 8,
            upper: 10
        },
        "bolt": {
            pp: 6,
            cost: 300,
            rank: 'Novice',
            group: 2,
            lower: 1,
            upper: 3
        },
        "boost/lower trait": {
            pp: 9,
            cost: 450,
            rank: 'Novice',
            group: 2,
            lower: 4,
            upper: 5
        },
        "burrow": {
            pp: 17,
            cost: 850,
            rank: 'Novice',
            group: 2,
            lower: 6,
            upper: 6
        },
        "burst": {
            pp: 2,
            cost: 100,
            rank: 'Novice',
            group: 2,
            lower: 7,
            upper: 8
        },
        "deflection": {
            pp: 9,
            cost: 450,
            rank: 'Novice',
            group: 2,
            lower: 9,
            upper: 10
        },
        "detect/conceal arcana": {
            pp: 2,
            cost: 100,
            rank: 'Novice',
            group: 3,
            lower: 1,
            upper: 2
        },
        "dispel": {
            pp: 3,
            cost: 150,
            rank: 'Seasoned',
            group: 3,
            lower: 3,
            upper: 4
        },
        "elemental manipulation": {
            pp: 1,
            cost: 50,
            rank: 'Novice',
            group: 3,
            lower: 5,
            upper: 5
        },
        "entangle": {
            pp: 6,
            cost: 300,
            rank: 'Novice',
            group: 3,
            lower: 6,
            upper: 7
        },
        "environmental protection": {
            pp: 11,
            cost: 550,
            rank: 'Novice',
            group: 3,
            lower: 8,
            upper: 10
        },
        "fear": {
            pp: 2,
            cost: 100,
            rank: 'Novice',
            group: 4,
            lower: 1,
            upper: 1
        },
        "fly": {
            pp: 15,
            cost: 750,
            rank: 'Veteran',
            group: 4,
            lower: 2,
            upper: 2
        },
        "greater healing": {
            pp: 20,
            cost: 1000,
            rank: 'Veteran',
            group: 4,
            lower: 3,
            upper: 3
        },
        "healing": {
            pp: 3,
            cost: 150,
            rank: 'Novice',
            group: 4,
            lower: 4,
            upper: 6
        },
        "invisibility": {
            pp: 12,
            cost: 600,
            rank: 'Seasoned',
            group: 4,
            lower: 7,
            upper: 7
        },
        "light": {
            pp: 10,
            cost: 500,
            rank: 'Novice',
            group: 4,
            lower: 8,
            upper: 10
        },
        "obscure": {
            pp: 9,
            cost: 450,
            rank: 'Novice',
            group: 5,
            lower: 1,
            upper: 2
        },
        "puppet": {
            pp: 10,
            cost: 500,
            rank: 'Veteran',
            group: 5,
            lower: 3,
            upper: 3
        },
        "quickness": {
            pp: 22,
            cost: 1100,
            rank: 'Seasoned',
            group: 5,
            lower: 4,
            upper: 5
        },
        "shape change": {
            pp: 16,
            cost: 800,
            rank: 'Novice',
            group: 5,
            lower: 6,
            upper: 6
        },
        "smite": {
            pp: 9,
            cost: 450,
            rank: 'Novice',
            group: 5,
            lower: 7,
            upper: 8
        },
        "speak language": {
            pp: 10,
            cost: 500,
            rank: 'Novice',
            group: 5,
            lower: 9,
            upper: 10
        },
        "speed": {
            pp: 8,
            cost: 400,
            rank: 'Novice',
            group: 6,
            lower: 1,
            upper: 3
        },
        "stun": {
            pp: 2,
            cost: 100,
            rank: 'Novice',
            group: 6,
            lower: 4,
            upper: 5
        },
        "telekinesis": {
            pp: 12,
            cost: 600,
            rank: 'Seasoned',
            group: 6,
            lower: 6,
            upper: 7
        },
        "teleport": {
            pp: 12,
            cost: 300,
            rank: 'Seasoned',
            group: 6,
            lower: 8,
            upper: 9
        },
        "zombie": {
            pp: 12,
            cost: 600,
            rank: 'Veteran',
            group: 6,
            lower: 10,
            upper: 10
        }
    };

    groupRoll = d(6);
    dieRoll = d(10);
    console.log('group '+groupRoll + 'and dieRoll: '+dieRoll);
    for (power in table7B_powersObj) {
        result = table7B_powersObj[power];
        if (groupRoll === result.group && dieRoll >= result.lower && dieRoll <= result.upper) {
            relicObj.scroll.power = power;
            relicObj.scroll.pp = result.pp;
            relicObj.scroll.rank = result.rank;
            relicObj.cost = result.cost;
            break;
        }
    }
}

//Table 8: Tomes
function table8_tomes(){
    table7_scrolls();
    relicObj.name = 'Tome';
    relicObj.tome = {};
    relicObj.tome.arcaneType = relicObj.scroll.arcaneType;
    relicObj.tome.power = relicObj.scroll.power;
    switch(relicObj.scroll.rank) {
        case 'Novice' :
            relicObj.cost = 500;
            break;
        case 'Seasoned' :
            relicObj.cost = 1000;
            break;
        case 'Veteran' :
            relicObj.cost = 2000;
            break;
        case 'Heroic' :
            relicObj.cost = 4000;
            break;
        case 'Legendary' :
            relicObj.cost = 8000;
            break;
    }
    delete relicObj.scroll;
}

function table9A_wandsStaves(){
    var relicType, result, table9A_wandsStavesObj = {
        "Staff": {
            typeRoll: function() {
                table9B_staves();
            },
            lower: 1,
            upper: 2
        },
        "Wand": {
            typeRoll: function() {
                table9C_wands();
            },
            lower: 3,
            upper: 20
        }
    };

    dieRoll = d(20);
    for (relicType in table9A_wandsStavesObj) {
        result = table9A_wandsStavesObj[relicType];
        if (dieRoll >= result.lower && dieRoll <= result.upper) {
            relicObj.relicType = relicType;
            result.typeRoll();
            break;
        }
    }
}

function table9B_staves(){
    var staff, result, table9B_stavesObj = {
        "Earthquakes":{
            cost: 13000,
            page: 86,
            lower: 1,
            upper: 3
        },
        "Fiery Doom": {
            cost: 27000,
            page: 87,
            lower: 4,
            upper: 6
        },
        "Mage Lord": {
            cost: 23000,
            page: 87,
            lower: 7,
            upper: 10
        },
        "Necromancer": {
            cost: 18000,
            page: 88,
            lower: 11,
            upper: 12
        },
        "Puppetry": {
            cost: 9000,
            page: 88,
            lower: 13,
            upper: 14
        },
        "Tempests": {
            cost: 18000,
            page: 89,
            lower: 15,
            upper: 16
        },
        "Warrior's Blessing": {
            cost: 9000,
            page: 89,
            lower: 17,
            upper: 20
        }
    };

    dieRoll = d(20);
    for (staff in table9B_stavesObj) {
        result = table9B_stavesObj[staff];
        if (dieRoll >= result.lower && dieRoll <= result.upper) {
            relicObj.name = staff;
            relicObj.cost = result.cost;
            relicObj.page = result.page;
            break;
        }
    }
}

function table9C_wands(){
    var groupRoll, wand, result, table9C_wandsObj = {
        "Blade Wand":{
            cost: 4500,
            page: 86,
            group: 1,
            lower: 1,
            upper: 2
        },
        "Dragon Breath": {
            cost: 5500,
            page: 86,
            group: 1,
            lower: 3,
            upper: 4
        },
        "Draining": {
            cost: 7500,
            page: 86,
            group: 1,
            lower: 5,
            upper: 5
        },
        "Fireballs": {
            cost: 5900,
            page: 86,
            group: 1,
            lower: 6,
            upper: 10
        },
        "Healing": {
            cost: 4500,
            page: 87,
            group: 2,
            lower: 1,
            upper: 3
        },
        "Heroes": {
            cost: 5500,
            page: 87,
            group: 2,
            lower: 4,
            upper: 6
        },
        "Lightning": {
            cost: 6900,
            page: 87,
            group: 2,
            lower: 7,
            upper: 8
        },
        "Luck": {
            cost: 4500,
            page: 87,
            group: 2,
            lower: 9,
            upper: 10
        },
        "Mini-fireballs": {
            cost: 4900,
            page: 87,
            group: 3,
            lower: 1,
            upper: 4
        },
        "Misfortune": {
            cost: 5500,
            page: 87,
            group: 3,
            lower: 5,
            upper: 6
        },
        "Petrification": {
            cost: 6500,
            page: 88,
            group: 3,
            lower: 7,
            upper: 7
        },
        "Shrinking": {
            cost: 5500,
            page: 88,
            group: 3,
            lower: 8,
            upper: 8
        },
        "Sluggish Reflexes": {
            cost: 6500,
            page: 89,
            group: 3,
            lower: 9,
            upper: 10
        },
        "Spirit Banishing": {
            cost: 6500,
            page: 89,
            group: 4,
            lower: 1,
            upper: 2
        },
        "Time Control": {
            cost: 7500,
            page: 89,
            group: 4,
            lower: 3,
            upper: 3
        },
        "Tongue Tied": {
            cost: 4500,
            page: 89,
            group: 4,
            lower: 4,
            upper: 5
        },
        "Vines": {
            cost: 4500,
            page: 89,
            group: 4,
            lower: 6,
            upper: 8
        },
        "Viper": {
            cost: 5500,
            page: 89,
            group: 4,
            lower: 9,
            upper: 10
        }
    };
    
    groupRoll = d(4);
    dieRoll = d(10);
    for (wand in table9C_wandsObj) {
        result = table9C_wandsObj[wand];
        if (groupRoll === result.group && dieRoll >= result.lower && dieRoll <= result.upper) {
            relicObj.name = wand;
            relicObj.cost = result.cost;
            relicObj.page = result.page;
            break;
        }
    }
}


//Table 11: Intelligent Relics
function table11_intelligentRelics() {
    relicObj.intelligent = {};

    var stats, result, dieRoll = d(20),
        numAttributes, numSkills, numPersonalities, numGoals,
        table11_intelligentRelicsObj = {
            stats1: {
                attribs: 1,
                skills: 7,
                personalities: 1,
                goals: 1,
                lower: 1,
                upper: 3
            },
            stats2: {
                attribs: 2,
                skills: 9,
                personalities: 1,
                goals: 1,
                lower: 4,
                upper: 8
            },
            stats3: {
                attribs: 3,
                skills: 11,
                personalities: 2,
                goals: 1,
                lower: 9,
                upper: 13
            },
            stats4: {
                attribs: 4,
                skills: 13,
                personalities: 2,
                goals: 1,
                lower: 14,
                upper: 16
            },
            stats5: {
                attribs: 6,
                skills: 15,
                personalities: 3,
                goals: 2,
                lower: 17,
                upper: 18
            },
            stats6: {
                attributes: 8,
                skills: 17,
                personalities: 3,
                goals: 2,
                lower: 19,
                upper: 19
            },
            stats7: {
                attribs: 10,
                skills: 20,
                personalities: 4,
                goals: 3,
                lower: 20,
                upper: 20
            }
        };

    //Create Intelligent Relic

    for (stats in table11_intelligentRelicsObj) {
        result = table11_intelligentRelicsObj[stats];
        if (dieRoll >= result.lower && dieRoll <= result.upper) {
            numAttributes = result.attribs;
            numSkills = result.skills;
            numPersonalities = result.personalities;
            numGoals = result.goals;
            break;
        }
    }

    table11_attributes(numAttributes);
    table11B_skills(numSkills);
    table11C_personality(numPersonalities);
    table11D_goalsAmbitions(numGoals);
}

function table11_attributes(numAttributes) {
    relicObj.intelligent.attributes = {
        "Smarts": "d4",
        "Spirit": "d4"
    };
    var i = 0,
        attrib;

    while (++i <= numAttributes) {
        switch (d(2)) {
            case 1:
                attrib = 'Smarts';
                break;
            case 2:
                attrib = 'Spirit';
                break;
        }
        switch (relicObj.intelligent.attributes[attrib]) {
            case 'd4':
                relicObj.intelligent.attributes[attrib] = 'd6';
                break;
            case 'd6':
                relicObj.intelligent.attributes[attrib] = 'd8';
                break;
            case 'd8':
                relicObj.intelligent.attributes[attrib] = 'd10';
                break;
            case 'd10':
                relicObj.intelligent.attributes[attrib] = 'd12';
                break;
            case 'd12':
                relicObj.intelligent.attributes[attrib] = 'd12+1';
                break;
            case 'd12+1':
                relicObj.intelligent.attributes[attrib] = 'd12+2';
                break;
            case 'd12+2':
                relicObj.intelligent.attributes[attrib] = 'd12+3';
                break;
            case 'd12+3':
                relicObj.intelligent.attributes[attrib] = 'd12+4';
                break;
            case 'd12+4':
                relicObj.intelligent.attributes[attrib] = 'd12+5';
                break;
            case 'd12+5':
                relicObj.intelligent.attributes[attrib] = 'd12+6';
                break;
        }
    }
}

function table11B_skills(numSkills) {
    relicObj.intelligent.skills = {};
    var i = 0,
        result, intelligentSkillsObj = {
            "Boating": {
                lower: 1,
                upper: 1
            },
            "Climbing": {
                lower: 2,
                upper: 2
            },
            "Gambling": {
                lower: 3,
                upper: 3
            },
            "Healing": {
                lower: 4,
                upper: 4
            },
            "Intimidation": {
                lower: 5,
                upper: 5
            },
            "Investigation": {
                lower: 6,
                upper: 6
            },
            "Knowledge (Specific skill)": {
                lower: 7,
                upper: 8
            },
            "Knowledge (Language)": {
                lower: 9,
                upper: 10
            },
            "Lockpicking": {
                lower: 11,
                upper: 11
            },
            "Notice": {
                lower: 12,
                upper: 12
            },
            "Persuasion": {
                lower: 13,
                upper: 13
            },
            "Repair": {
                lower: 14,
                upper: 14
            },
            "Stealth": {
                lower: 15,
                upper: 15
            },
            "Streetwise": {
                lower: 16,
                upper: 16
            },
            "Survival": {
                lower: 17,
                upper: 17
            },
            "Swimming": {
                lower: 18,
                upper: 18
            },
            "Taunt": {
                lower: 19,
                upper: 19
            },
            "Tracking": {
                lower: 20,
                upper: 20
            }
        };

    while (++i <= numSkills) {
        dieRoll = d(20);
        for (skill in intelligentSkillsObj) {
            result = intelligentSkillsObj[skill];
            if (dieRoll >= result.lower && dieRoll <= result.upper) {
                switch (relicObj.intelligent.skills[skill]) {
                    case undefined:
                        relicObj.intelligent.skills[skill] = 'd4';
                        break;
                    case 'd4':
                        relicObj.intelligent.skills[skill] = 'd6';
                        break;
                    case 'd6':
                        relicObj.intelligent.skills[skill] = 'd8';
                        break;
                    case 'd8':
                        relicObj.intelligent.skills[skill] = 'd10';
                        break;
                    case 'd10':
                        relicObj.intelligent.skills[skill] = 'd12';
                        break;
                    case 'd12':
                        i--;
                        break;
                }
                break;
            }
        }
    }
}

function table11C_personality(numPersonalities) {
    relicObj.intelligent.personality = {};
    var i = 0;
    while (++i <= numPersonalities) {
        switch (d(20)) {
            case 1:
                personality = 'cruel';
                break;
            case 2:
                personality = 'happy';
                break;
            case 3:
                personality = 'gung ho';
                break;
            case 4:
                personality = 'lazy';
                break;
            case 5:
                personality = 'manipulative';
                break;
            case 6:
                personality = 'crude';
                break;
            case 7:
                personality = 'clueless';
                break;
            case 8:
                personality = 'mysterious';
                break;
            case 9:
                personality = 'creative';
                break;
            case 10:
                personality = 'cowardly';
                break;
            case 11:
                personality = 'heroic';
                break;
            case 12:
                personality = 'insane';
                break;
            case 13:
                personality = 'bloodthirsty';
                break;
            case 14:
                personality = 'optimistic';
                break;
            case 15:
                personality = 'pessimistic';
                break;
            case 16:
                personality = 'suspicious';
                break;
            case 17:
                personality = 'talkative';
                break;
            case 18:
                personality = 'helpful';
                break;
            case 19:
                personality = 'contrary';
                break;
            case 20:
                personality = 'aloof';
                break;
        }
        if (relicObj.intelligent.personality[personality]) {
            i--;
        } else {
            relicObj.intelligent.personality[personality] = i;
        }
    }
}

function table11D_goalsAmbitions(numGoals) {
    relicObj.intelligent.goals = {};
    var i = 0,
        result, intelligentGoalsObj = {
            'promote a religion': {
                lower: 1,
                upper: 2
            },
            'oppose a religion': {
                lower: 3,
                upper: 4
            },
            'overthrow tyranny': {
                lower: 5,
                upper: 6
            },
            'overthrow a just ruler': {
                lower: 7,
                upper: 8
            },
            'become a ruler': {
                lower: 9,
                upper: 9
            },
            'avenge some slight': {
                lower: 10,
                upper: 11
            },
            'acquire fame and glory': {
                lower: 12,
                upper: 13
            },
            'destroy a certain race': {
                lower: 14,
                upper: 15
            },
            'aid a certain race': {
                lower: 16,
                upper: 17
            },
            'see the world': {
                lower: 18,
                upper: 19
            },
            'gain a permanent body or be destroyed': {
                lower: 20,
                upper: 20
            }
        };
    while (++i <= numGoals) {
        dieRoll = d(20);

        for (goal in intelligentGoalsObj) {
            result = intelligentGoalsObj[goal];
            if (dieRoll >= result.lower && dieRoll <= result.upper) {
                if (relicObj.intelligent.goals[goal]) {
                    i--;
                } else {
                    relicObj.intelligent.goals[goal] = i;
                }

                break;
            }
        }
    }
}

//Process Special tables
function processSpecial(tableObj, rerolled) {

    var dieRoll, numRolls, i = 0, special, result;

    //roll twice if this is a reroll
    switch (rerolled) {
        case true:
            numRolls = 2;
            break;
        case false:
            numRolls = 1;
            break;
    }

    while (++i <= numRolls) {
        dieRoll = d(20);

        while (rerolled === true && dieRoll === 20) {
            dieRoll = d(20);
        }

        for (special in tableObj) {
            result = tableObj[special];
            if (dieRoll >= result.lower && dieRoll <= result.upper) {
                result.special();
                break;
            }
        }
    }
}

//Process Edges tables
function processEdges(tableObj, numEdges) {
    var dieRoll, edge, result, i = 0;
    while (++i <= numEdges) {
        dieRoll = d(20);
        for (edge in tableObj) {
            //Assign key properties to a variable
            result = tableObj[edge];
            //Roll through object to find match and assign values accordingly
            if (dieRoll >= result.lower && dieRoll <= result.upper) {
                //set up Edges property
                if ((!relicObj.Edges && edge !== 'Increased Range') || (edge === 'Fast Load' && relicObj.reloadRate === 2)) {
                    relicObj.Edges = {};
                }

                //grab the property as the Edge name
                //console.log("Edge rolled: " + edge);
                //If the Edge was previously rolled and no room for improved version, dump it; if the max number of Edges is one, and Improved Edge rolled, dump it.
                if (edge !== 'Increased Range' && ((relicObj.Edges[edge] && (result.improved === undefined || result.improved === true)) || relicObj.Edges[result.improved] || (numEdges === i && result.improved === true && !relicObj.Edges[result.required]))) {
                    if (edge === "Command" && relicObj.Edges[edge]) {
                        result.reroll();
                    } else {
                        i--;
                        //console.log("Duplicate or not enough slots; rerolling");
                        //generate additional roll
                   }
                } else if (edge !== 'Increased Range' && (result.improved === true && ((numEdges === i && relicObj.Edges[result.required]) || (numEdges > 1 && i < numEdges)))) {
                    if (relicObj.Edges[result.required]) {
                        //If the required Edge already exists, remove it.
                        delete relicObj.Edges[result.required];
                        //console.log("Removed required Edge");
                        relicObj.cost -= tableObj[result.required].cost;
                    } else {
                        //If the required Edge didn't already exist, eat up a slot.
                        i++;
                    }
                    //Add the Edge
                    relicObj.Edges[edge] = i;
                    relicObj.cost += result.cost;
                    //console.log("Improved Edge added");
                } else if (edge !== 'Increased Range' && (relicObj.Edges[edge] && typeof result.improved === "string")) {

                    //If you rolled a duplicate required Edge, remove the required version, and add the improved version.
                    delete relicObj.Edges[edge];
                    relicObj.cost -= result.cost;
                    //Add the improved version
                    relicObj.Edges[result.improved] = i;
                    relicObj.cost += tableObj[result.improved].cost;
                    //console.log("Duplicate required Edge; replaced with improved Edge");

                } else {
                    if ((edge === 'Fast Load' && (relicObj.reloadRate === undefined || relicObj.reloadRate === 1)) || edge === 'Increased Range') {
                        //console.log('Increased Range from ' + edge);
                        tableObj["Increased Range"].increasedRange();
                        relicObj.cost += tableObj['Increased Range'].cost;
                        //relicObj.Edges["Increased Range"] =  i;
                    } else {
                        //Add the Edge initially rolled above
                        relicObj.Edges[edge] = i;
                        //console.log("Simply added the Edge");
                        relicObj.cost += result.cost;
                    }
                }
                break;
            }
        }
    }
}

//Process Powers tables
function processPowers(tableObj, numPowers, artifactType) {
    var i = 0,
        groupRoll, result, power, powerEffect, powerRank, powerPoints;

    while (++i <= numPowers) {
        groupRoll = d(4);
        dieRoll = d(20);
        for (power in tableObj) {
            result = tableObj[power];
            if (result.group !== undefined && dieRoll > 10) {
                dieRoll = d(10);
            }
            if ((groupRoll === result.group || result.group === undefined) && dieRoll >= result.lower && dieRoll <= result.upper) {
                if (artifactType === "Major Artifact with raise" && result["Major Artifact"].withRaise === false) {
                    artifactType = "Major Artifact";
                }

                if (artifactType !== "Minor Artifact" && result["Major Artifact"].effects !== undefined) {
                    var resultEffects = result["Major Artifact"].effects();
                    powerEffect = resultEffects[0];
                    powerPoints = resultEffects[1];
                    powerRank = resultEffects[2];
                } else if (result["Major Artifact"].effects === undefined) {
                    powerPoints = result["Major Artifact"].basePowerPoints;
                }

                if (!relicObj.powers) {
                    relicObj.powers = {};
                }

                if (!relicObj.powers[artifactType]) {
                    relicObj.powers[artifactType] = {};
                }

                if ((artifactType === "Minor Artifact" && relicObj.powers[artifactType][power] === "standard") || (relicObj.powers[artifactType][power] && relicObj.powers[artifactType][power] === powerEffect)) {
                    i--;
                } else {

                    if (artifactType === "Minor Artifact" || ((artifactType === "Major Artifact" || artifactType === "Major Artifact with raise") && result["Major Artifact"].effects === undefined)) {
                        relicObj.powers[artifactType][power] = "standard";
                    } else {
                        relicObj.powers[artifactType][power] = powerEffect;
                    }

                    var rankCost;
                    //If the rank isn't determined by effect, use rank property.

                    if (result.rank !== 'Special' || powerRank === undefined) {
                        powerRank = result.rank;
                    }

                    switch (powerRank) {
                        case 'Novice':
                            rankCost = 1000;
                            break;
                        case 'Seasoned':
                            rankCost = 2000;
                            break;
                        case 'Veteran':
                            rankCost = 3000;
                            break;
                        case 'Heroic':
                            rankCost = 4000;
                            break;
                        case 'Legendary':
                            rankCost = 5000;
                            break;
                    }

                    //Determine cost based on power points of Major Artifact or Major Artifact with raise; base default of 3500 for Minor Artifacts
                    switch (artifactType) {
                        case 'Minor Artifact':
                            if (relicObj.powers["Minor Artifact"]) {
                                //add the cost for Minor Artifacts only once (applied during first power selection)
                                artifactCost = 0;
                            } else {
                                artifactCost = 3500;
                            }
                            break;
                        case 'Major Artifact':
                            artifactCost = powerPoints * 2000;
                            break;
                        case 'Major Artifact with raise':
                            artifactCost = powerPoints * 3000;
                            break;
                    }
                    relicObj.cost += (rankCost + artifactCost);
                }
                break;
            }
        }
    }
}