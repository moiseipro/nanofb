$('.exercise').click(function(){
        $.ajax({
            url: 'includes/ajax.php',
            type: 'POST',
            data: {exercise: this.dataset.exercise},
            success: function(res){
               $('#info').html(res);
            },
            error: function(){
                alert('Error!');
            }
        });
        return false;
    });
    

