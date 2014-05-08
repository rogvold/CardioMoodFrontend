

# On click, send the user to the element they want
$('.sidebar .nav li a, .scroller').click ->
	el = $(this).attr('href')
	offset = $(el).offset().top - 60
	$('html, body').animate(
		scrollTop: offset
	, 
		200
	)
	return false


# Contact form ---------------

validateEmail = (email)->
	re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\.+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email)

$('#contact_form').submit ->

	$('.alert', this).remove()

	$('input[type=submit]').attr('disabled', 'disabled')

	name = $('#name', this).val()
	email = $('#email', this).val()
	subject = $('#subject', this).val()
	message = $('#message', this).val()

	if (name is '') or (email is '') or (subject is '') or (message is '')
		$('#contact_form').prepend """
		<div class="alert">
			<button type="button" class="close" data-dismiss="alert">×</button>
			<strong>Error!</strong> No fields can be left blank.
		</div>
		"""

		$('input[type=submit]').removeAttr('disabled')

		return false


	# Validate email
	if !validateEmail(email)
		$('#contact_form').prepend """
		<div class="alert">
			<button type="button" class="close" data-dismiss="alert">×</button>
			<strong>Warning!</strong> Best check yo self, you're not looking too good.
		</div>
		"""
		$('input[type=submit]').removeAttr('disabled')

		return false


	$.post("mailer.php", { name: name, email: email, subject: subject, message: message }, (data)->
		if data is ''
			$('#contact_form').prepend """
			<div class="alert alert-danger">
				<button type="button" class="close" data-dismiss="alert">×</button>
				<strong>Error!</strong> Something went wrong, try later.
			</div>
			"""
		
		if data is 'success'
			$('#contact_form').prepend """
            <div class="alert alert-success">
				<button type="button" class="close" data-dismiss="alert">×</button>
				<strong>Success!</strong> Your message was sent.
			</div>
			"""

			$('#contact_form input[type=text], #contact_form input[type=email], #contact_form textarea').val('')

			$('input[type=submit]').removeAttr('disabled')
	)

	return false

