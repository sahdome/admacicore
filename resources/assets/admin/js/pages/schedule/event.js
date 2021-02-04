$(document).ready(function () {
    $('.selectpicker').on('change', function (e) {
        e.preventDefault();
        var option = $(this).find("option:selected");
        if (option.hasAttr('class') && option.attr('class') == 'option-new')
            window.location = option.val();
    });

    if ($(".timepicker").length != 0) {
        $('.timepicker').datetimepicker({
            format: 'H:mm', // use this format if you want the 24hours timepicker
            //format: 'h:mm A', //use this format if you want the 12hours timpiecker with AM/PM toggle
            icons: {
                time: "now-ui-icons tech_watch-time",
                date: "now-ui-icons ui-1_calendar-60",
                up: "fa fa-chevron-up",
                down: "fa fa-chevron-down",
                previous: 'now-ui-icons arrows-1_minimal-left',
                next: 'now-ui-icons arrows-1_minimal-right',
                today: 'fa fa-screenshot',
                clear: 'fa fa-trash',
                close: 'fa fa-remove'
            }
        });
    }

    $('.btn#btn-cancel').on('click', function (e) {
        e.preventDefault();
        swal({
            title: 'Tem certeza?',
            text: "Suas modificações não serão salvas",
            type: 'warning',
            showCancelButton: true,
            confirmButtonClass: 'btn btn-success',
            cancelButtonClass: 'btn btn-danger',
            confirmButtonText: 'Sim, continuar',
            buttonsStyling: false
        }).then(function () {
            setTimeout(() => {
                window.location = '/';
            }, 300);
        });
    });

    $('.btn#btn-save').on('click', function (e) {
        e.preventDefault();

        var form = $('#form_schedule');
        var action = form.attr('action');
        var formData = new FormData(form[0]);

        $.ajax({
            type: "post",
            url: action,
            data: formData,
            dataType: 'json',
            processData: false,
            contentType: false,
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function (data) {
                status = (typeof data['status'] !== 'undefined') ? data['status'] : {
                    status: 'error'
                };
                message = (typeof data['message'] !== 'undefined') ? data['message'] : {
                    message: 'Erro ao executar ação. Contactar suporte'
                };
                switch (status) {
                    case 'ok':
                        swal({
                            title: "Feito!",
                            text: "Ação executada com sucesso",
                            buttonsStyling: false,
                            confirmButtonClass: "btn btn-success",
                            type: "success"
                        }).then(function (isConfirm) {
                            if (isConfirm) {
                                setTimeout(() => {
                                    window.location = data['redirect'];
                                }, 300);
                            }
                        });
                        break;
                    case 'warning':
                        swal("Oops...", message, "warning");
                        break;
                    case 'error':
                        swal("Oops...", message, "error");
                        break;
                    default:
                        swal("Oops...", 'Sem resposta do servidor. Entre em contato com o suporte', "warning");
                        break;
                }
            },
            error: function (jqXHR, text, error) {
                swal("Oops...", '[' + error + ']: ' + 'Entre em contato com o suporte', "error");
            }
        });

        return true;
    });

    $('#input_cep').on('paste keyup', function (e) {
        var cep = $(this).val().replace(/[^0-9]/g, '');
        console.log('change');
        if (cep.length == 8) {
            var url = 'https://viacep.com.br/ws/' + cep + '/json';
            $('#loading').fadeIn();
            $.ajax({
                type: "get",
                url: url,
                dataType: 'json',
                success: function (data) {
                    rua = (typeof data['logradouro'] != 'undefined') ? data['logradouro'] : '';
                    bairro = (typeof data['bairro'] != 'undefined') ? data['bairro'] : '';
                    cidade = (typeof data['localidade'] != 'undefined') ? data['localidade'] : '';
                    estado = (typeof data['uf'] != 'undefined') ? data['uf'] : '';

                    document.getElementById("input_rua").value = rua;
                    document.getElementById("input_bairro").value = bairro;
                    document.getElementById("input_cidade").value = cidade;
                    document.getElementById("input_estado").value = estado;
                },
                error: function (jqXHR, text, error) {
                    console.log('[' + error + ']: ' + 'Entre em contato com o suporte');
                }
            }).done(function (data) {
                $('#loading').fadeOut();
            });
        }
    });

    setFormValidation('#form_new_member');
});

function setFormValidation(id) {
    $(id).validate({
        highlight: function (element) {
            $(element).closest('.form-group').removeClass('has-success').addClass('has-danger');
            $(element).closest('.form-check').removeClass('has-success').addClass('has-danger');
        },
        success: function (element) {
            $(element).closest('.form-group').removeClass('has-danger').addClass('has-success');
            $(element).closest('.form-check').removeClass('has-danger').addClass('has-success');
        },
        errorPlacement: function (error, element) {
            $(element).append(error);
        },
    });
}
