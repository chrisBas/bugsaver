window.onload = function() {
	testMode = new TestMode();
}

function TestMode(){

	function setupBottomRight() {
		var div = document.createElement('div');
		var btn = document.createElement('button');

		btn.classList.add('c-btn');
		btn.title = "Exit test mode.";
		btn.innerText = "Stop Test Mode";
		btn.addEventListener('click', stopTestMode);

		div.classList.add('dev');
		div.classList.add('bottom-right');
		div.appendChild(btn);
		return div;
	}

	function setupBottomLeft() {
		var div = document.createElement('div');
		var bugBtn = document.createElement('button');
		var exportBtn = document.createElement('button');

		bugBtn.classList.add('c-btn');
		bugBtn.title = "Create a bug report.";
		bugBtn.innerText = "Add Bug";
		bugBtn.addEventListener('click', addBugModal);

		exportBtn.classList.add('c-btn');
		exportBtn.title = "Export bugs.";
		exportBtn.innerText = "Export Bugs";
		exportBtn.addEventListener('click', exportBugsModal);

		div.classList.add('dev');
		div.classList.add('bottom-left');
		div.appendChild(bugBtn);
		div.appendChild(exportBtn);
		return div;
	}

	function setupModal() {
		var modal = document.createElement('div');
		var container = document.createElement('div');

		container.id = "c-modal-container";

		modal.classList.add('dev');
		modal.id = "c-modal";
		modal.addEventListener('click', toggleModal);
		modal.appendChild(container);

		return modal;
	}
	
	this.setup = function() {
		this.cleanup();
		document.body.appendChild(setupBottomRight());
		document.body.appendChild(setupBottomLeft());
		document.body.appendChild(setupModal());
	}
	
	this.cleanup = function() {
		var devElements = document.getElementsByClassName('dev');
		for( var idx=devElements.length-1; idx>=0; idx--) {
			document.body.removeChild(devElements[idx]);
		}
	}
}

var contents = []

function stopTestMode() {
	testMode.cleanup();
}

function createTextField(labelText,inputText="") {
	let div = document.createElement('div');
	div.classList.add('c-modal-field');

	let label = document.createElement('label');
	label.innerText = labelText;
	div.appendChild(label);

	let input = document.createElement('input');
	input.type = "text";
	input.value = inputText;
	input.required = true;
	input.name = labelText.split(" ").join("").toLowerCase();
	div.appendChild(input);
	
	return div;
}

function createSelectField(labelText, optionTexts) {
	let div = document.createElement('div');
	div.classList.add('c-modal-field');

	let label = document.createElement('label');
	label.innerText = labelText;
	div.appendChild(label);

	let select = document.createElement('select');
	select.name = labelText.split(" ").join("").toLowerCase();
	for(var i in optionTexts){
		let opt = document.createElement('option');
		opt.value = optionTexts[i].split(" ").join("").toLowerCase();
		opt.innerText = optionTexts[i];
		select.appendChild(opt);
	}
	div.appendChild(select);
	
	return div;
}

function addBug() {
	let form = event.target;
	let inputs = form.getElementsByTagName("input");
	let selects = form.getElementsByTagName("select");
	var content = {};

	for(var i=0; i<inputs.length; i++) {
		content[inputs[i].name] = inputs[i].value;
	}
	for(var i=0; i<selects.length; i++) {
		content[selects[i].name] = selects[i].value;
	}

	contents.push(content);
	toggleModal(true);
	return false;
}

function addBugModal() {
	let container = document.getElementById("c-modal-container");
	container.innerHTML = "";

	let btnDiv = document.createElement('div');
	btnDiv.classList.add('c-form-btn-container')
	let submitBtn = document.createElement('button');
	submitBtn.innerText = "Submit";
	let cancelBtn = document.createElement('button');
	cancelBtn.innerText = "Cancel";
	cancelBtn.addEventListener('click', toggleModal);
	cancelBtn.forceClose = true;	// used in modal to forcefully close the modal
	cancelBtn.type = "button";
	btnDiv.appendChild(submitBtn);
	btnDiv.appendChild(cancelBtn);

	let form = document.createElement('form');
	form.onsubmit = addBug;
	form.appendChild( createTextField("Issue") );
	form.appendChild( createTextField("Expected") );
	form.appendChild( createTextField("Actual", window.getSelection().toString()) );
	form.appendChild( createSelectField("Severity", ["Minor", "Medium", "Major"]) );
	form.appendChild(btnDiv);
	container.appendChild(form);

	if(document.getElementById("c-modal").style.display != "block")
		toggleModal();
}

function toggleModal(forceClose) {
	var modal = document.getElementById('c-modal');
	var notInContainer = true;
	if(event.target.forceClose == true || forceClose == true) {
		modal.style.display = "none";
		return;
	}
	if(modal.style.display == 'block'){
		if(event != null){
			for(var i=0; i < event.path.length; i++) {
				if(event.path[i].id === "c-modal-container"){
					return;
				}
			}
		}
		modal.style.display = "none";
		return;
	}
	modal.style.display = "block";
}

function exportBugsModal() {
	let container = document.getElementById("c-modal-container");
	container.innerHTML = "";

	let btnDiv = document.createElement('div');
	btnDiv.classList.add('c-form-btn-container')
	let submitBtn = document.createElement('button');
	submitBtn.innerText = "Submit";
	let cancelBtn = document.createElement('button');
	cancelBtn.innerText = "Cancel";
	cancelBtn.addEventListener('click', toggleModal);
	cancelBtn.forceClose = true;	// used in modal to forcefully close the modal
	cancelBtn.type = "button";
	btnDiv.appendChild(submitBtn);
	btnDiv.appendChild(cancelBtn);

	let table = document.createElement('table');
	table.classList.add('c-modal-table');
	let thead = document.createElement('thead');
	let headRow = document.createElement('tr');
	var keys = [];
	for(var key in contents[0]) {
		keys.push(key);
		let th = document.createElement('th');
		th.innerText = key;
		headRow.appendChild(th);
	}
	thead.appendChild(headRow);
	let tbody = document.createElement('tbody');
	for(var i=0; i<contents.length; i++) {
		let tr = document.createElement('tr');
		for(var j=0; j<keys.length; j++) {
			let td = document.createElement('td');
			td.innerText = contents[i][keys[j]];
			tr.appendChild(td);
		}
		tbody.appendChild(tr);
	}
	table.appendChild(thead);
	table.appendChild(tbody);

	let form = document.createElement('form');
	form.onsubmit = exportBugs;
	form.appendChild(table);
	form.appendChild(btnDiv);
	container.appendChild(form);

	if(document.getElementById("c-modal").style.display != "block")
		toggleModal();
}

function exportBugs() {
	// var text = "Issue,Severity,Current State,Desired State"
	// 	+ "\r\nIncorrect Text,3,Hello Word,Hello World";

	// var element = document.createElement('a');
	// element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURI(text));
	// element.setAttribute('download', 'bugs.csv');
	// element.style.display = 'none';
	// document.body.appendChild(element);
	// element.click();
	// document.body.removeChild(element);
}