/*
  Slidemenu
*/
var gapiPromise = (function(){
	var deferred = $.Deferred();
	window.onLoadCallback = function(){
	  deferred.resolve(gapi);
	};
	return deferred.promise()
}());

(function () {
	var $body = document.body,
		$menu_trigger = $body.getElementsByClassName('menu-trigger')[0];

	if (typeof $menu_trigger !== 'undefined') {
		$menu_trigger.addEventListener('click', function () {
			$body.className = ($body.className == 'menu-active') ? '' : 'menu-active';
		});
	}

}).call(this);

let token = localStorage.getItem('token')
let name = localStorage.getItem('name')

if (!token) {
	window.location.replace('http://localhost:8080/login')
}

function logout() {
	localStorage.clear()
	location.reload()
	document.location.href = "https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=http://localhost:8080/"
}

$.ajax({
		method: 'GET',
		url: 'http://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=1'
	})
	.done(function (quotes) {
		let content = quotes[0].content
		let title = quotes[0].title
		$('#quotes').text('').append(
			`
		<h3>${title}</h3>
				${content}
		`)
	})

$('#slide-menu').append(
	`<center>
		<h4 style="color:white;padding:10px;" >Welcome ${name}</h4>
		</center>
		<ol>
			<li>To-Do-List</li>
			<li onclick="logout()">Logout</li>
		</ol>`
)

function getTask(){
	$.ajax({
		method: 'GET',
		url: `http://localhost:3000/api/get-list?token=${token}`
	})
	.done(function (tasks) {
		let totalLeft = 0
		// for
		$('#done-items').text('')
		$('#cards').text('')
		tasks.forEach(task => {
			if (task.status) {
				$('#done-items').append(
					`
					<li> ${task.name} <button class="remove-item btn btn-default btn-xs pull-right" onclick="removeTask('${task._id}')">X</button></li>
					`
				)
			} else {
				totalLeft += 1
				let date = new Date(task.dueDate)
				// console.log(task.dueDate.getFullYear());
				
				// $('#sortable').append(
				// 	`
				// 	<label onclick="showTask('${task._id}')" value="${task._id}" style="cursor: pointer;"><h4>${task.name}</h4></label> <br>
				// 	<div class="modal-create" id="${task._id}">
				// 		<!-- Modal content -->
				// 		<div class="modal-content">
				// 			<span class="close" onclick="hideTask('${task._id}')">&times;</span>
				// 			<input type="text" placeholder="Name To-do" class="col-25" id="name" value="${task.name}"> <br>
				// 			<textarea id="description" cols="50" rows="5" placeholder="description....">${task.description}</textarea>
				// 			<br>
				// 			${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}
				// 			<br>
				// 			<span style="cursor:pointer; padding-right:50px;" onclick="doneTask('${task._id}','1')">Done Task</span> 
				// 			<span style="cursor:pointer; padding-left:50px;" >Update Task</span>
				// 		</div>
				// 	</div>
				// 	`
				// )
				$('#cards').append(`
				<div class="col s12 m6 l4">
				<div class="card">
					<div class="card-content white-text">
						<span class="card-title grey-text text-darken-4">${task.name}</span>
						<p class="card-subtitle grey-text text-darken-2">${task.description}</p>
						<span class="blue-text text-darken-2 card-info">${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}</span>
					</div>
					<div class="card-action">
						<a href="#" onclick="doneTask('${task._id}','1')">Done Task</a>
					</div>
				</div>
			</div>`)
				$('.modal-create').hide()
			}
		})
		$('.todo-footer').text('').append(`Items Left ${totalLeft}`)
	})
	.fail(function (err) {
		alert(JSON.stringify(err))
	})
}
function hideTask(id){
	$(`#${id}`).hide()
}

function showTask(id){
	$(`#${id}`).show()
}
getTask()

function doneTask(taskId, status) {
	$.ajax({
			method: 'PUT',
			url: `http://localhost:3000/api/edit-todo?token=${token}`,
			data: {
				todoId: taskId,
				status: status
			}
		})
		.done(function (updated) {
			getTask()
			// location.reload()
		})
		.fail(function (err) {
			alert(JSON.stringify(err))
		})
}

$('input').keypress(function (e) {
	if (e.which == 13) {
		let value = $('input').val()
		if(value !== ''){
			$.ajax({
				method: 'POST',
				url: `http://localhost:3000/api/create-todo?token=${token}`,
				data: {
					task: value
				}
			})
			.done(function () {
				getTask()
				$('#form').val('')
			})
			.fail(function (err) {
				alert(JSON.stringify(err))
			})
		}
	}
});

function removeTask(id) {
	$.ajax({
			method: 'DELETE',
			url: `http://localhost:3000/api/remove-todo?token=${token}`,
			data: {
				todoId: id
			}
		})
		.done(function () {
			getTask()
		})
		.fail(function (err) {
			alert(JSON.stringify(err))
		})
}
let form = $('#form').val('')

$('#createTodo').click(function(event){
	let name = $('#name').val()
	let description = $('#description').val()
	let date = $('#date').val()
	if(name !== ''){
		$.ajax({
			method: 'POST',
			url: `http://localhost:3000/api/create-todo?token=${token}`,
			data:{
				name: name,
				description: description,
				dueDate: date
			}
		})
		.done(function(result){
			getTask()
		})
		.fail(function(err){
			console.log(err)
		})
	}
})
$('.modal-create').hide()
