$.fn.DataTable.ColVis.prototype._fnDomColumnButton = function (i) {
	var
		that = this,
		column = this.s.dt.aoColumns[i],
		dt = this.s.dt;

	var title = this.s.fnLabel === null ?
		column.sTitle :
		this.s.fnLabel(i, column.sTitle, column.nTh);

	return $(
		'<li ' + (dt.bJUI ? 'class="ui-button ui-state-default"' : '') + '>' +
		'<label>' +
		'<input type="checkbox" />' +
		'<span>' + title + '</span>' +
		'</label>' +
		'</li>'
	)
		.click(function (e) {
			var showHide = !$('input', this).is(":checked");
			if (e.target.nodeName.toLowerCase() !== "li") {
				showHide = !showHide;
			}

			/* Need to consider the case where the initialiser created more than one table - change the
			 * API index that DataTables is using
			 */
			var oldIndex = $.fn.dataTableExt.iApiIndex;
			$.fn.dataTableExt.iApiIndex = that._fnDataTablesApiIndex();

			// Optimisation for server-side processing when scrolling - don't do a full redraw
			if (dt.oFeatures.bServerSide) {
				that.s.dt.oInstance.fnSetColumnVis(i, showHide, false);
				that.s.dt.oInstance.fnAdjustColumnSizing(false);
				if (dt.oScroll.sX !== "" || dt.oScroll.sY !== "") {
					that.s.dt.oInstance.oApi._fnScrollDraw(that.s.dt);
				}
				that._fnDrawCallback();
			} else {
				that.s.dt.oInstance.fnSetColumnVis(i, showHide);
			}

			$.fn.dataTableExt.iApiIndex = oldIndex; /* Restore */

			if ((e.target.nodeName.toLowerCase() === 'input' || e.target.nodeName.toLowerCase() === 'li') && that.s.fnStateChange !== null) {
				that.s.fnStateChange.call(that, i, showHide);
			}
		})[0];
};

$.fn.dataTableExt.oSort['damage100-asc'] = function (a, b) {
	return parseFloat(a) - parseFloat(b);
};
$.fn.dataTableExt.oSort['damage100-desc'] = function (a, b) {
	return parseFloat(b) - parseFloat(a);
};

$.fn.dataTableExt.oSort['damage48-asc'] = function (a, b) {
	return parseInt(a) - parseInt(b);
};
$.fn.dataTableExt.oSort['damage48-desc'] = function (a, b) {
	return parseInt(b) - parseInt(a);
};

function performCalculations() {
	var attacker, defender, setName, setTier, attacker2, defender2;
	var selectedTiers = getSelectedTiers(); //"(redux Custom Set)";
	var setOptions = getSetOptions();
	var dataSet = [];
	var pokeInfo = $("#p1");
	for (var i = 0; i < setOptions.length; i++) {
		if (setOptions[i].id && typeof setOptions[i].id !== "undefined") {
			setName = setOptions[i].id.substring(setOptions[i].id.indexOf("(") + 1, setOptions[i].id.lastIndexOf(")"));
			setTier = setName.substring(0, setName.indexOf(" "));
//			if (mode === "one-vs-all") {
//				setTier = setName
//			} else {
//				setTier = setName;
//			}

			if($('#customTierName').val() === ""){
//				setTier = setName.substring(0, setName.indexOf(" "));
				setTier = setName
				selectedTiers = "redux Custom Set";
			}
			else
			{
				setTier = setName
			}
//			if (selectedTiers.indexOf(setTier) !== -1) {
//			if (setTier.indexOf(selectedTiers) !== -1) {
			if (selectedTiers == setTier){ // || setTier == "SidneyInsane" || setTier == "PhoebeInsane" || setTier == "GlaciaInsane" || setTier == "DrakeInsane" || setTier == "WallaceInsane") {
				console.log(selectedTiers.indexOf(setTier));
				var field = createField();
					attacker = createPokemon(setOptions[i].id);
					defender = createPokemon(pokeInfo);
					attacker2 = createPokemon(pokeInfo);
					defender2 = createPokemon(setOptions[i].id);
//field.swap();
//				if (mode === "one-vs-all") {
//					attacker = createPokemon(pokeInfo);
//					defender = createPokemon(setOptions[i].id);
//					attacker2 = createPokemon(setOptions[i].id);
//					defender2 = createPokemon(pokeInfo);
//				} else {
//					attacker = createPokemon(setOptions[i].id);
//					defender = createPokemon(pokeInfo);
//					attacker2 = createPokemon(pokeInfo);
//					defender2 = createPokemon(setOptions[i].id);
//					field.swap();
//				}
				if (attacker.ability === "Unburden") {
					attacker.ability = "Pressure";
				}
				if (attacker.ability === "Rivalry") {
					attacker.gender = "N";
				}
				if (defender.ability === "Rivalry") {
					defender.gender = "N";
				}
				console.log(attacker, defender);
				var damageResults = calculateMovesOfAttacker(gen, attacker, defender, field);
				attacker = damageResults[0].attacker;
				defender = damageResults[0].defender;
				var result, minMaxDamage, minDamage, maxDamage, minPercentage, maxPercentage, minPixels, maxPixels;
				var highestDamage = -1;
				var data = [attacker.name];
				var data5 = [];
				var data7 = [];
				var statusString = "";
				for (var n = 0; n < 4; n++) {
					result = damageResults[n];
					minMaxDamage = result.range();
					minDamage = minMaxDamage[0] * attacker.moves[n].hits;
					maxDamage = minMaxDamage[1] * attacker.moves[n].hits;
					minPercentage = Math.floor(minDamage * 1000 / defender.maxHP()) / 10;
					maxPercentage = Math.floor(maxDamage * 1000 / defender.maxHP()) / 10;
					minPixels = Math.floor(minDamage * 48 / defender.maxHP());
					maxPixels = Math.floor(maxDamage * 48 / defender.maxHP());
					if (maxDamage > highestDamage && !attacker.moves[n].name.includes("Explosion")) {
						highestDamage = maxDamage;
						while (data.length > 1) {
							data.pop();
						}
						data.push(attacker.name.replace("-", "").substring(0, 6) + "_" + parseInt(minPercentage) + "_" + attacker.moves[n].name.replace(" ", "").substring(0, 5));
						data.push(attacker.moves[n].name.replace("Hidden Power", "HP"));
						data.push(minPercentage + " - " + maxPercentage + "%");
						data.push(minPixels + " - " + maxPixels + "px");
						data.push(result.kochance(false).text);
//						data.push(attacker.moves[n].bp === 0 ? 'nice move' : (result.kochance(false).text || 'possibly the worst move ever'));
					}
						data7.push(attacker.name.replace("-", "").substring(0, 6) + "_" + parseInt(minPercentage) + "_" + attacker.moves[n].name.replace(" ", "").substring(0, 5));
						data5.push(attacker.moves[n].name.replace("Hidden Power", "HP"));
						data5.push(minPercentage + " - " + maxPercentage + "%");
				}
				console.log(data);
				data.push((mode === "one-vs-all") ? attacker.types[0] : attacker.types[0]);
				data.push(((mode === "one-vs-all") ? attacker.types[1] : attacker.types[1]) || "");
				data.push(((mode === "one-vs-all") ? attacker.ability : attacker.ability) || "");
				data.push(((mode === "one-vs-all") ? attacker.item : attacker.item) || "");
				if (attacker.stats.spe === defender.stats.spe) {
					data.push("Tie");
				}
				else
				{
					data.push(((attacker.stats.spe > defender.stats.spe) ? "Yes" : "No") || "");
				}
				var field2 = createField();
				field2.swap();
				if (attacker2.ability === "Rivalry") {
					attacker2.gender = "N";
				}
//				if (attacker2.ability === "Unburden") {
//					attacker2.ability = "Pressure";
//				}
				if (defender2.ability === "Rivalry") {
					defender2.gender = "N";
				}
//				if (defender2.ability === "Unburden") {
//					defender2.ability = "Pressure";
//				}
//				defender2.nature = "Bold";
				var damageResults2 = calculateMovesOfAttacker(gen, attacker2, defender2, field2);
				attacker2 = damageResults2[0].attacker;
				defender2 = damageResults2[0].defender;
				var result2, minMaxDamage2, minDamage2, maxDamage2, minPercentage2, maxPercentage2, minPixels2, maxPixels2;
				var highestDamage2 = -1;
//				var data = [setOptions[i].id];
				var data2 = [];
				var data3 = [];
				for (var n = 0; n < 4; n++) {
					result2 = damageResults2[n];
					minMaxDamage2 = result2.range();
//					if(attacker2.ability === "Skill Link" && ["Tail Slap", "Rock Blast", "Bullet Seed", "Icicle Spear"].includes(attacker2.moves[n]))
//					{
//						minDamage2 = minMaxDamage2[0] * 5;
//						maxDamage2 = minMaxDamage2[1] * 5;
//					}
//					else
//					{
//						minDamage2 = minMaxDamage2[0] * attacker2.moves[n].hits;
//						maxDamage2 = minMaxDamage2[1] * attacker2.moves[n].hits;
//					}
					minDamage2 = minMaxDamage2[0] * attacker2.moves[n].hits;
					maxDamage2 = minMaxDamage2[1] * attacker2.moves[n].hits;
					minPercentage2 = Math.floor(minDamage2 * 1000 / defender2.maxHP()) / 10;
					maxPercentage2 = Math.floor(maxDamage2 * 1000 / defender2.maxHP()) / 10;
					minPixels2 = Math.floor(minDamage2 * 48 / defender2.maxHP());
					maxPixels2 = Math.floor(maxDamage2 * 48 / defender2.maxHP());
					if (maxDamage2 > highestDamage2 && !attacker2.moves[n].name.includes("Explosion")) {
						highestDamage2 = maxDamage2;
						while (data2.length > 0) {
							data2.pop();
						}
						data2.push(attacker2.moves[n].name.replace("Hidden Power", "HP"));
						data2.push(minPercentage2 + " - " + maxPercentage2 + "%");
						data2.push(minPixels2 + " - " + maxPixels2 + "px");
//						data2.push(attacker2.moves[n].bp === 0 ? 'nice move' : (result2.kochance(false).text || 'possibly the worst move ever'));
						data2.push(result2.kochance(false).text);
					}
					data7.push(attacker2.name.replace("-", "").substring(0, 6) + "_" + parseInt(minPercentage2) + "_" + attacker2.moves[n].name.replace(" ", "").substring(0, 5));
//					data7.push(attacker2.name.replace("-", "") + ": " + attacker2.moves[n].name.replace(" ", ""));
					data3.push(attacker2.moves[n].name.replace("Hidden Power", "HP"));
					data3.push(minPercentage2 + " - " + maxPercentage2 + "%");
//					data3.push(minPixels2 + " - " + maxPixels2 + "px");
//					data3.push(attacker2.moves[n].bp === 0 ? 'nice move' : (result2.kochance(false).text || 'possibly the worst move ever'));
				}

				var data4 = [];
				data2 = data2.concat(data3);
				data4 = data.concat(data2);
				if(data4[0].includes("Ditto"))
				{
					data.push(2);
				}
//				else if((data4[14].includes("OHKO") && (data4[14].includes("Focus Sash") || data4[14].includes("Sturdy"))) && data4[10].includes("No"))
				else if (data4[14].includes("OHKO") && data4[10].includes("No") && (!data4[9].includes("Focus Sash") && !data4[8].includes("Sturdy")))
				{
					data.push(-1);
				}
				else if(data4[0].includes("Wynaut") && (!data4[10].includes("No") || !data4[14].includes("OHKO"))) //look idk
				{
					data.push(2);
				}
				else if(data4[0].includes("Wobbuffet") && (!data4[10].includes("No") || !data4[14].includes("OHKO")))  //look idk
				{
					data.push(2);
				}
				else if(data4[5].includes("OHKO") && !data4[10].includes("No"))
				{
					data.push(5);
				}
				else if(data4[5].includes("OHKO") && data4[10].includes("No") && (!data4[14].includes("OHKO") || data4[9].includes("Focus Sash") || data4[8].includes("Sturdy")))
				{
					data.push(4);
				}
				else if(data4[10].includes("Yes") && parseInt(data4[3].substring(0, data4[3].indexOf(" "))) > parseInt(data4[12].substring(0, data4[12].indexOf(" "))))
				{
					data.push(3);
				}
				else if(data4[10].includes("No") && parseInt(data4[3].substring(0, data4[3].indexOf(" "))) > parseInt(data4[12].substring(0, data4[12].indexOf(" "))))
				{
					data.push(2);
				}
				else if(!data4[10].includes("No"))
				{
					data.push(1);
				}
				else
				{
					data.push(0);
				}
				var maxSwitchHit = 0.0;
				if($("#nL1").prop("checked") && parseFloat(data2[5].substring(data2[5].indexOf(" ")+2 , data2[5].indexOf("%"))) > maxSwitchHit){
					maxSwitchHit = parseFloat(data2[5].substring(data2[5].indexOf(" ")+2 , data2[5].indexOf("%")));
				}
				if($("#nL2").prop("checked") && parseFloat(data2[7].substring(data2[7].indexOf(" ")+2 , data2[7].indexOf("%"))) > maxSwitchHit){
					maxSwitchHit = parseFloat(data2[7].substring(data2[7].indexOf(" ")+2 , data2[7].indexOf("%")));
				}
				if($("#nL3").prop("checked") && parseFloat(data2[9].substring(data2[9].indexOf(" ")+2 , data2[9].indexOf("%"))) > maxSwitchHit){
					maxSwitchHit = parseFloat(data2[9].substring(data2[9].indexOf(" ")+2 , data2[9].indexOf("%")));
				}
				if($("#nL4").prop("checked") && parseFloat(data2[11].substring(data2[11].indexOf(" ")+2 , data2[11].indexOf("%"))) > maxSwitchHit){
					maxSwitchHit = parseFloat(data2[11].substring(data2[11].indexOf(" ")+2 , data2[11].indexOf("%")));
				}
				var myHP = 100.00;
				var prioityDamage = 0.0;
				var theirHP = $('.percent-hp').val();
				var myHits = 0;
				var myHitsSitrus = 0;
				var theirHits = 0;
				var theirHitsScarf = 0;
				if(!data[10].includes("Yes"))
				{
					theirHits += 1;
					theirHitsScarf += 1;
					//if(data5[0].includes("First Impression"))
					if(["First Impression"].includes(data5[0]))
					{
						prioityDamage += parseFloat(data5[1].substring(0, data5[1].indexOf(" ")))
					}
					else if(["Sucker Punch", "Extreme Speed", "Aqua Jet", "Mach Punch", "Accelerock"].includes(data5[6]))
					{
						prioityDamage += parseFloat(data5[7].substring(0, data5[7].indexOf(" ")))
					}
				}
					if(data5[0].includes("Fake Out"))
					{
						prioityDamage += parseFloat(data5[1].substring(0, data5[1].indexOf(" ")))
					}
				myHP -= maxSwitchHit;
				myHits += Math.ceil(myHP / parseFloat(data2[1].substring(data2[1].indexOf(" ")+2, data2[1].indexOf("%"))));
				myHitsSitrus += Math.ceil((myHP+25.00) / parseFloat(data2[1].substring(data2[1].indexOf(" ")+2, data2[1].indexOf("%"))));
				theirHits += Math.ceil((theirHP-prioityDamage) / parseFloat(data[3].substring(0, data[3].indexOf(" "))));
				theirHitsScarf += Math.ceil((theirHP-(prioityDamage*1.2)) / (parseFloat(data[3].substring(0, data[3].indexOf(" ")))*1.2));
				//data.push(myHits >= theirHits);
//				data.push(myHits >= theirHitsScarf);
//				data.push(myHitsSitrus >= theirHits);
				data.push(Math.max(0,parseInt(myHP - ((theirHits-1)*parseFloat(data2[1].substring(data2[1].indexOf(" ")+2, data2[1].indexOf("%")))))));
				data.push(Math.max(0,parseInt(myHP - ((theirHitsScarf-1)*parseFloat(data2[1].substring(data2[1].indexOf(" ")+2, data2[1].indexOf("%")))))));
				data.push(Math.max(0, parseInt((myHP+25) - ((theirHitsScarf-1)*parseFloat(data2[1].substring(data2[1].indexOf(" ")+2, data2[1].indexOf("%")))))));
				data = data.concat(data2);
				data = data.concat(data5);
				data = data.concat(data7);
				//data.push(data2);
				dataSet.push(data);
			}
		}
	}
	var pokemon = mode === "one-vs-all" ? defender : defender;
	if (pokemon) pokeInfo.find(".sp .totalMod").text(pokemon.stats.spe);
	table.rows.add(dataSet).draw();
}

function getSelectedTiers() {
	var selectedTiers = $('.tiers input:checked').map(function () {
		return this.id;
	}).get();
//	if(selectedTiers[0]==="Custom"){
//		if (mode === "all-vs-one") {
//			var index=$('#customSelect').val();
//			selectedTiers=JSON.parse(localStorage.customTiers)[index].tierName;
//		}
//		else {
//			selectedTiers=$('#customTierName').val();
//		}
//	}
	if(selectedTiers[0]==="Custom"){
		if($('#customTierName').val() === ""){
			var index=$('#customSelect').val();
			selectedTiers=JSON.parse(localStorage.customTiers)[index].tierName;
		}
//		else if($('#customTierName').val().includes("E4Insane"))
//		{
//			selectedTiers[0] = "SidneyInsane";
//			selectedTiers[1] = "PhoebeInsane";
//			selectedTiers[2] = "GlaciaInsane";
//			selectedTiers[3] = "DrakeInsane";
//			selectedTiers[4] = "WallaceInsane";
//		}
		else {
			doubleList = "";
			if($('#customTierName').val().includes("["))
			{
				doubleList = $('#customTierName').val().substring(0, $('#customTierName').val().indexOf(" ["));
			}
			else
			{
				doubleList = $('#customTierName').val();
			}
			if($('#customTierName').val().includes("&"))
			{
				selectedTiers[0] = doubleList.substring(0, $('#customTierName').val().indexOf(" &"));
				selectedTiers[1] = doubleList.substring($('#customTierName').val().indexOf("& ")+2);
//				selectedTiers[0] = "Elite Four SidneyDouble";
//				selectedTiers[1] = "Elite Four Phoebe";
//				selectedTiers[2] = "Elite Four Glacia";
//				selectedTiers[3] = "Elite Four Drake";
//				selectedTiers[4] = "Champion Wallace";

				$("#doubles-format").prop("checked", true);
			}
			else
			{
				selectedTiers = doubleList;
			}

		}
	}
//	$("#doubles-format").prop("checked", true);
	return selectedTiers;
}

function calculateMovesOfAttacker(gen, attacker, defender, field) {
	var results = [];
	for (var i = 0; i < 4; i++) {
		results[i] = calc.calculate(gen, attacker, defender, attacker.moves[i], field);
	}
	return results;
}

function calculateMovesOfAttackerSwitch(gen, attacker, defender, field) {
	return calc.calculate(gen, defender, attacker, defender.moves[4], field);
}

$(".gen").change(function () {
	$(".tiers input").prop("checked", false);
	$("#singles-format").attr("disabled", false);
	adjustTierBorderRadius();

	if ($.fn.DataTable.isDataTable("#holder-2")) {
		table.clear();
		constructDataTable();
		placeHonkBsBtn();
	}
});

function adjustTierBorderRadius() {
	var squaredLeftCorner = {"border-top-left-radius": 0, "border-bottom-left-radius": 0};
	var roundedLeftCorner = {"border-top-left-radius": "8px", "border-bottom-left-radius": "8px"};
	if (gen <= 2) {
		$("#UU").next("label").css(roundedLeftCorner);
	} else {
		$("#UU").next("label").css(squaredLeftCorner);
		$("#NU").next("label").css(roundedLeftCorner);

		if (gen > 3) {
			$("#NU").next("label").css(squaredLeftCorner);
			$("#LC").next("label").css(roundedLeftCorner);

			if (gen > 4) {
				$("#LC").next("label").css(squaredLeftCorner);
				$("#Doubles").next("label").css(roundedLeftCorner);

				if (gen > 5) {
					$("#Doubles").next("label").css(squaredLeftCorner);
				}
			}
		}
	}
}

var table;
function constructDataTable() {
	table = $("#holder-2").DataTable({
		destroy: true,
		columnDefs: [
			{
				targets: (mode === "one-vs-all") ? [4, 5, 6, 7, 8, 9, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 12, 13, 14] : [4, 5, 6, 7, 8, 9, 17, 18],
				visible: false,
				searchable: false
			},
			{
				targets: [3, 16, 20, 22, 24, 26, 11, 12, 13, 14],
				type: 'damage100'
			},
			{
				targets: [4, 17],
				type: 'damage48'
			},
			{targets: [5, 18],
				iDataSort: 2
			}
		],
		dom: 'C<"clear">fti',
		colVis: {
			//exclude: (gen > 2) ? [0, 1, 2] : (gen === 2) ? [0, 1, 2, 7] : [0, 1, 2, 7, 8],
			exclude: (gen > 2) ? [4,5,6,7,8,9,17,18] : (gen === 2) ? [4,5,6,7,8,9,17,18] : [4,5,6,7,8,9,17,18],
			stateChange: function (iColumn, bVisible) {
				var column = table.settings()[0].aoColumns[iColumn];
				if (column.bSearchable !== bVisible) {
					column.bSearchable = bVisible;
					table.rows().invalidate();
				}
			}
		},
		paging: false,
		scrollX: Math.floor(dtWidth / 100) * 100, // round down to nearest hundred
		scrollY: dtHeight,
		scrollCollapse: true
	});
	$(".dataTables_wrapper").css({"max-width": dtWidth});
}

function placeHonkBsBtn() {
	//Didn't see any adverse effects from removing absolute positioning?
	//var honkalculator = "<button style='position:absolute' class='bs-btn bs-btn-default'>Honkalculate</button>";
	var honkalculator = "<button class='bs-btn bs-btn-default'>Honkalculate</button>";
	$("#holder-2_wrapper").prepend(honkalculator);
	$(".bs-btn").click(function () {
		var formats = getSelectedTiers();
		//var formats = "Ruin Maniac Andres";
		if (!formats.length) {
			$(".bs-btn").popover({
				content: "No format selected",
				placement: "right"
			}).popover('show');
			setTimeout(function () { $(".bs-btn").popover('destroy'); }, 1350);
		}
		table.clear();
		performCalculations();
	});
}

$(".mode").change(function () {
	if ($("#one-vs-one").prop("checked")) {
		var params = new URLSearchParams(window.location.search);
		params.delete('mode');
		params = '' + params;
		window.location.replace('index' + linkExtension + (params.length ? '?' + params : ''));
	} else if ($("#randoms").prop("checked")) {
		var params = new URLSearchParams(window.location.search);
		params.delete('mode');
		params = '' + params;
		window.location.replace('randoms' + linkExtension + (params.length ? '?' + params : ''));
	} else {
		var params = new URLSearchParams(window.location.search);
		params.set('mode', $(this).attr("id"));
		window.location.replace('honkalculate' + linkExtension + '?' + params);
	}
});

$(".tiers label").mouseup(function () {
	var oldID = $('.tiers input:checked').attr("id");
	var newID = $(this).attr("for");
	if ((oldID === "Doubles" || startsWith(oldID, "VGC")) && (newID !== oldID)) {
		$("#singles-format").attr("disabled", false);
		$("#singles-format").prop("checked", true);
	}
	if ((startsWith(oldID, "VGC") || oldID === "LC") && (!startsWith(newID, "VGC") && newID !== "LC")) {
		setLevel("100");
	}
	if(newID==="Custom"){
		//read level and whether tier is doubles or singles (maybe? see notes)

	}
});

$(".tiers input").change(function () {
	var type = $(this).attr("type");
	var id = $(this).attr("id");
	//$(".tiers input").not(":" + type).prop("checked", false); // deselect all radios if a checkbox is checked, and vice-versa

	if (id === "Doubles" || startsWith(id, "VGC")) {
		$("#doubles-format").prop("checked", true);
		$("#singles-format").attr("disabled", true);
	}

	if (id === "LC" && $('.level').val() !== "5") {
		setLevel("5");
	}

	if (startsWith(id, "VGC") && $('.level').val() !== "50") {
		setLevel("50");
	}

	//if(id==="Custom"&&$("#customSelect").children().length>=1) $("#customSelect").trigger("change");
});

function setLevel(lvl) {
	$('.level').val(lvl);
	$('.level').keyup();
	$('.level').popover({
		content: "Level has been set to " + lvl,
		placement: "right"
	}).popover('show');
	setTimeout(function () { $('.level').popover('destroy'); }, 1350);
}

$(".set-selector").change(function (e) {
	var genWasChanged;
	var format = getSelectedTiers()[0];
	if (genWasChanged) {
		genWasChanged = false;
	} else if (startsWith(format, "VGC") && $('.level').val() !== "50") {
		setLevel("50");
	} else if (format === "LC" && $('.level').val() !== "5") {
		setLevel("5");
	}
});

var dtHeight, dtWidth;
$(document).ready(function () {
	var params = new URLSearchParams(window.location.search);
	window.mode = params.get("mode");
	if (window.mode) {
		if (window.mode === "randoms") {
			window.location.replace("randoms" + linkExtension + "?" + params);
		} else if (window.mode !== "one-vs-all" && window.mode !== "all-vs-one") {
			window.location.replace("index" + linkExtension + "?" + params);
		}
	} else {
		window.mode = "one-vs-all";
	}
	if(window.mode === "one-vs-all")
	{
		loadCustomList("p1");
	}
	$("#" + mode).prop("checked", true);
	$("#Custom").prop("checked", true);
	$("#holder-2 th:first").text((mode === "one-vs-all") ? "Attacker" : "Attacker");
	$("#holder-2").show();

	calcDTDimensions();
	constructDataTable();
	placeHonkBsBtn();
});

function calcDTDimensions() {
	$("#holder-2").DataTable({
		dom: 'C<"clear">frti'
	});

	var theadBottomOffset = getBottomOffset($(".sorting"));
	var heightUnderDT = getBottomOffset($(".holder-0")) - getBottomOffset($("#holder-2 tbody"));
	dtHeight = $(document).height() - theadBottomOffset - heightUnderDT;
	dtWidth = $(window).width() - $("#holder-2").offset().left;
	dtWidth -= 2 * parseFloat($(".holder-0").css("padding-right"));
}

function getBottomOffset(obj) {
	return obj.offset().top + obj.outerHeight();
}

$("#clearCustom").click(function(){
	if (confirm("Are you sure you want to delete your custom tiers/sets? This action cannot be undone.")) {
		localStorage.removeItem("customTiers");
		localStorage.removeItem("customsets");
		location.reload();
	}
});

$("#customSelect").change(function(){
	var index=$(this).val();
	if($("#Custom").prop("checked")){
		//setLevel(customTiers[index].level);
		if(customTiers[index].doubles){
			$("#doubles-format").prop("checked", true);
		}else{
			$("#singles-format").prop("checked", true);
		}
	}
});

$("#importedSets").click(function () {
	var pokeID = "p1";
	var showCustomSets = $(this).prop("checked");
	if (showCustomSets) {
		loadCustomList(pokeID);
	} else {
		loadDefaultLists();
	}
});
