<?php
	
	// CHANGE THIS TO YOUR EMAIL
	$your_address = "filip.stefansson@gmail.com";


	// Ceck if all variables are set.
	if ( isset($_POST['name'] ) && isset($_POST['email']) && isset($_POST['subject']) && isset($_POST['message']) ) {

		// Set variables
		$name = $_POST['name'];
		$email = $_POST['email'];
		$subject = $_POST['subject'];
		$message = $_POST['message'];

		$content = "You have been contacteed by $name($email)

		Subject: $subject
		Message: $message

		Reply to: $email
		";


		// Send
		$headers = "From: $email" . PHP_EOL;
		$headers .= "Reply-To: $email" . PHP_EOL;
		$headers .= "MIME-Version: 1.0" . PHP_EOL;
		$headers .= "Content-type: text/plain; charset=utf-8" . PHP_EOL;
		$headers .= "Content-Transfer-Encoding: quoted-printable" . PHP_EOL;

		// If sent
		if(mail($your_address, $subject, $content, $headers)) {

			echo 'success';

		}


	} else {

		// If one of the fiels are empty, return error
		return false;

	}

?>