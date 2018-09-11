
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
	window.location.replace('/login')
}

function logout() {
	localStorage.clear()
	location.reload()
	document.location.href = "https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=https://todo-fancy-1536427031886.firebaseapp.com/"
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
		url: `https://obscure-ravine-84067.herokuapp.com/api/get-list?token=${token}`
	})
	.done(function (tasks) {
		let totalLeft = 0
		// for
		$('#doneTask').text('')
		$('#notDoneYet').text('')
		tasks.forEach(task => {
			let date = new Date(task.dueDate)
			if (task.status) {
				$('#doneTask').append(
					`
					<div class="col s12 m6 l4">
						<!-- Card 1 -->
						<div class="card">
							<div class="card-content white-text">
								<span class="card-title grey-text text-darken-4">${task.name}</span>
								<p class="card-subtitle grey-text text-darken-2">${task.description}</p>
								<span class="blue-text text-darken-2 card-info">${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}</span>
							</div>
							<div class="card-action">
							<a href="#" class="card-action-right" onclick="updateTask('${task._id}','0')">Uncomplete Task</a> <br>
								<a href="#" class="card-action-right" onclick="removeTask('${task._id}')">Remove Task</a> 
							</div>
						</div>
						<!-- End of card -->
					</div>
					`
				)
			} else {
				totalLeft += 1
				$('#notDoneYet').append(`
				<div class="col s12 m6 l4">
				<div class="card">
					<div class="card-content white-text">
						<span class="card-title grey-text text-darken-4">${task.name}</span>
						<p class="card-subtitle grey-text text-darken-2">${task.description}</p>
						<span class="blue-text text-darken-2 card-info">${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}</span>
					</div>
					<div class="card-action">
						<a href="#" onclick="updateTask('${task._id}','1')">Complete Task</a>
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

function updateTask(taskId, status) {
	$.ajax({
			method: 'PUT',
			url: `https://obscure-ravine-84067.herokuapp.com/api/edit-todo?token=${token}`,
			data: {
				todoId: taskId,
				status: status
			}
		})
		.done(function (updated) {
			getTask()
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
				url: `https://obscure-ravine-84067.herokuapp.com/api/create-todo?token=${token}`,
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
			url: `https://obscure-ravine-84067.herokuapp.com/api/remove-todo?token=${token}`,
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
			url: `https://obscure-ravine-84067.herokuapp.com/api/create-todo?token=${token}`,
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
