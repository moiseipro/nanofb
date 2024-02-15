function ToggleUpFilter(id, state) {
    let currentList = null;
    let activeElem = null;
    let graphicsWidth = '';
    let folderType = "";
    switch(id) {
        case "toggle_side_filter":
            $('.up-tabs-elem[data-id="toggle_tags_filter"]').removeClass('selected3');
            $('.up-tabs-elem[data-id="toggle_tags_filter"]').attr('data-state', '0');
            $('div.side-filter-block').toggleClass('d-none', !state);
            $('div.tags-filter-block').toggleClass('d-none', true);
            break;
        case "toggle_tags_filter":
            $('.up-tabs-elem[data-id="toggle_side_filter"]').removeClass('selected3');
            $('.up-tabs-elem[data-id="toggle_side_filter"]').attr('data-state', '0');
            $('div.tags-filter-block').toggleClass('d-none', !state);
            $('div.side-filter-block').toggleClass('d-none', true);
            break;
        case "toggle_up_filter":
            $('div.btns-tabs-second').fadeToggle(300, (e) => {});
            break;
        case "cols_size":
            if ($('.up-tabs-elem[data-id="toggle_side_filter"]').attr('data-state') == '1') {
                $('.exercises-list').find('div.gutter').toggleClass('d-none', !state);
            } else {
                swal("Внимание", "Включите сначала \"Фильтрацию\".", "info");
                $('.up-tabs-elem[data-id="cols_size"]').attr('data-state', '0');
                $('.up-tabs-elem[data-id="cols_size"]').removeClass('btn-primary');
                $('.up-tabs-elem[data-id="cols_size"]').addClass('btn-secondary');
            }
            break;
        case "nfb_folders":
            if (IsSelectedExercisesForDelete()) {
                $('.up-tabs-elem[data-id="nfb_folders"]').removeClass('selected3');
                swal({
                    title: "Очистить список выбранных для удаления упражнений?",
                    text: "Чтобы сменить папки, необходимо очистить список выбранных для удаления упражнений",
                    icon: "warning",
                    buttons: ["Отмена", "Подтвердить"],
                    dangerMode: true,
                })
                .then((willClear) => {
                    if (willClear) {
                        IsSelectedExercisesForDelete(true);
                    }
                });
                return;
            }

            $('.up-tabs-elem[data-id="nfb_folders"]').removeClass('selected3');
            $('.exs_counter').html("(...)");

            if ($('.up-tabs-elem[data-id="club_folders"]').length > 0) {
                $('.folders_nfb_list').toggleClass('d-none', true);
                $('.folders_club_list').toggleClass('d-none', false);
                $('.folders_list').toggleClass('d-none', true);
                $('.folders_nfb_list').toggleClass('selected', false);
                $('.folders_club_list').toggleClass('selected', true);
                $('.folders_list').toggleClass('selected', false);
                $('.exercises-list').find('.list-group-item:not(.side-filter-elem)').removeClass('active');
                $('.exs-list-group').html('<li class="list-group-item py-2">Выберите для начала папку.</li>');
    
                $('.up-tabs-elem[data-id="nfb_folders"]').toggleClass('d-none', true);
                $('.up-tabs-elem[data-id="club_folders"]').toggleClass('d-none', false);
                $('.up-tabs-elem[data-id="team_folders"]').toggleClass('d-none', true);
                $('.up-tabs-elem[data-id="nfb_folders"]').toggleClass('selected', false);
                $('.up-tabs-elem[data-id="club_folders"]').toggleClass('selected', true);
                $('.up-tabs-elem[data-id="team_folders"]').toggleClass('selected', false);

                $('.up-tabs-elem').removeClass('b-c-blue2');
                $('.up-tabs-elem').removeClass('b-c-green2');
                $('.up-tabs-elem').addClass('b-c-red2');

                $('.in-card-elem').removeClass('b-c-blue2');
                $('.in-card-elem').removeClass('b-c-green2');
                $('.in-card-elem').addClass('b-c-red2');
            } else {
                $('.folders_nfb_list').toggleClass('d-none', true);
                $('.folders_club_list').toggleClass('d-none', true);
                $('.folders_list').toggleClass('d-none', false);
                $('.folders_nfb_list').toggleClass('selected', false);
                $('.folders_club_list').toggleClass('selected', false);
                $('.folders_list').toggleClass('selected', true);
                $('.exercises-list').find('.list-group-item:not(.side-filter-elem)').removeClass('active');
                $('.exs-list-group').html('<li class="list-group-item py-2">Выберите для начала папку.</li>');
    
                $('.up-tabs-elem[data-id="nfb_folders"]').toggleClass('d-none', true);
                $('.up-tabs-elem[data-id="club_folders"]').toggleClass('d-none', true);
                $('.up-tabs-elem[data-id="team_folders"]').toggleClass('d-none', false);
                $('.up-tabs-elem[data-id="nfb_folders"]').toggleClass('selected', false);
                $('.up-tabs-elem[data-id="club_folders"]').toggleClass('selected', false);
                $('.up-tabs-elem[data-id="team_folders"]').toggleClass('selected', true);

                $('.up-tabs-elem').addClass('b-c-blue2');
                $('.up-tabs-elem').removeClass('b-c-green2');
                $('.up-tabs-elem').removeClass('b-c-red2');

                $('.in-card-elem').addClass('b-c-blue2');
                $('.in-card-elem').removeClass('b-c-green2');
                $('.in-card-elem').removeClass('b-c-red2');
            }

            $('#exerciseCopyModal').find('select[name="copy_mode"]').val('1');
            $('#exerciseCopyModal').find('select[name="copy_mode"]').prop('disabled', true);
            CountFilteredExs();

            $('.toggle-filter-content').removeClass('btn-custom-outline-blue');
            $('.toggle-filter-content').removeClass('btn-custom-outline-green');
            $('.toggle-filter-content').addClass('btn-custom-outline-red');
            CountExsInFoldersByType();
            ToggleTagsView();

            folderType = $('.folders_div.selected').attr('data-id');
            $('.exs-edit-block').find('.d-e-nf').toggleClass('d-none', folderType == "nfb_folders");
            $('.folders-block').find('button.edit-exercise.d-e-nf').toggleClass('d-none', folderType == "nfb_folders");
            break;
        case "club_folders":
            if (IsSelectedExercisesForDelete()) {
                $('.up-tabs-elem[data-id="club_folders"]').removeClass('selected3');
                swal({
                    title: "Очистить список выбранных для удаления упражнений?",
                    text: "Чтобы сменить папки, необходимо очистить список выбранных для удаления упражнений",
                    icon: "warning",
                    buttons: ["Отмена", "Подтвердить"],
                    dangerMode: true,
                })
                .then((willClear) => {
                    if (willClear) {
                        IsSelectedExercisesForDelete(true);
                    }
                });
                return;
            }

            $('.up-tabs-elem[data-id="club_folders"]').removeClass('selected3');
            $('.exs_counter').html("(...)");

            $('.folders_nfb_list').toggleClass('d-none', true);
            $('.folders_club_list').toggleClass('d-none', true);
            $('.folders_list').toggleClass('d-none', false);
            $('.folders_nfb_list').toggleClass('selected', false);
            $('.folders_club_list').toggleClass('selected', false);
            $('.folders_list').toggleClass('selected', true);

            $('.up-tabs-elem[data-id="nfb_folders"]').toggleClass('d-none', true);
            $('.up-tabs-elem[data-id="club_folders"]').toggleClass('d-none', true);
            $('.up-tabs-elem[data-id="team_folders"]').toggleClass('d-none', false);
            $('.up-tabs-elem[data-id="nfb_folders"]').toggleClass('selected', false);
            $('.up-tabs-elem[data-id="club_folders"]').toggleClass('selected', false);
            $('.up-tabs-elem[data-id="team_folders"]').toggleClass('selected', true);
            CountFilteredExs();

            $('.toggle-filter-content').removeClass('btn-custom-outline-green');
            $('.toggle-filter-content').removeClass('btn-custom-outline-red');
            $('.toggle-filter-content').addClass('btn-custom-outline-blue');
            $('.up-tabs-elem').removeClass('b-c-green2');
            $('.up-tabs-elem').removeClass('b-c-red2');
            $('.up-tabs-elem').addClass('b-c-blue2');

            $('.in-card-elem').removeClass('b-c-green2');
            $('.in-card-elem').removeClass('b-c-red2');
            $('.in-card-elem').addClass('b-c-blue2');

            CountExsInFoldersByType();
            ToggleTagsView();

            folderType = $('.folders_div.selected').attr('data-id');
            $('.exs-edit-block').find('.d-e-nf').toggleClass('d-none', folderType == "nfb_folders");
            $('.folders-block').find('button.edit-exercise.d-e-nf').toggleClass('d-none', folderType == "nfb_folders");
            break;
        case "team_folders":
            if (IsSelectedExercisesForDelete()) {
                $('.up-tabs-elem[data-id="team_folders"]').removeClass('selected3');
                swal({
                    title: "Очистить список выбранных для удаления упражнений?",
                    text: "Чтобы сменить папки, необходимо очистить список выбранных для удаления упражнений",
                    icon: "warning",
                    buttons: ["Отмена", "Подтвердить"],
                    dangerMode: true,
                })
                .then((willClear) => {
                    if (willClear) {
                        IsSelectedExercisesForDelete(true);
                    }
                });
                return;
            }
            $('.up-tabs-elem[data-id="team_folders"]').removeClass('selected3');
            $('.exs_counter').html("(...)");

            $('.folders_nfb_list').toggleClass('d-none', false);
            $('.folders_club_list').toggleClass('d-none', true);
            $('.folders_list').toggleClass('d-none', true);
            $('.folders_nfb_list').toggleClass('selected', true);
            $('.folders_club_list').toggleClass('selected', false);
            $('.folders_list').toggleClass('selected', false);
            $('.exercises-list').find('.list-group-item:not(.side-filter-elem)').removeClass('active');
            $('.exs-list-group').html('<li class="list-group-item py-2">Выберите для начала папку.</li>');

            $('.up-tabs-elem[data-id="nfb_folders"]').toggleClass('d-none', false);
            $('.up-tabs-elem[data-id="club_folders"]').toggleClass('d-none', true);
            $('.up-tabs-elem[data-id="team_folders"]').toggleClass('d-none', true);
            $('.up-tabs-elem[data-id="nfb_folders"]').toggleClass('selected', true);
            $('.up-tabs-elem[data-id="club_folders"]').toggleClass('selected', false);
            $('.up-tabs-elem[data-id="team_folders"]').toggleClass('selected', false);

            $('#exerciseCopyModal').find('select[name="copy_mode"]').prop('disabled', false);
            CountFilteredExs();

            $('.toggle-filter-content').removeClass('btn-custom-outline-blue');
            $('.toggle-filter-content').removeClass('btn-custom-outline-red');
            $('.toggle-filter-content').addClass('btn-custom-outline-green');
            $('.up-tabs-elem').removeClass('b-c-blue2');
            $('.up-tabs-elem').removeClass('b-c-red2');
            $('.up-tabs-elem').addClass('b-c-green2');

            $('.in-card-elem').removeClass('b-c-blue2');
            $('.in-card-elem').removeClass('b-c-red2');
            $('.in-card-elem').addClass('b-c-green2');

            CountExsInFoldersByType();
            ToggleTagsView();

            folderType = $('.folders_div.selected').attr('data-id');
            $('.exs-edit-block').find('.d-e-nf').toggleClass('d-none', folderType == "nfb_folders");
            $('.folders-block').find('button.edit-exercise.d-e-nf').toggleClass('d-none', folderType == "nfb_folders");
            break;
        case "toggle_trainer":
            $('.up-tabs-elem[data-id="nfb_folders"]').toggleClass('c-hidden', state);
            $('.up-tabs-elem[data-id="club_folders"]').toggleClass('c-hidden', state);
            $('.up-tabs-elem[data-id="team_folders"]').toggleClass('c-hidden', state);
            $('.up-tabs-elem[data-id="trainer_folders"]').toggleClass('c-hidden', !state);
            $('.up-tabs-elem[data-id="trainer_folders"]').toggleClass('d-none', !state);

            $('.exs-list-group').toggleClass('trainer-list', state);

            $('.folders_nfb_list').toggleClass('c-hidden', state);
            $('.folders_club_list').toggleClass('c-hidden', state);
            $('.folders_list').toggleClass('c-hidden', state);
            $('.folders_trainer_list').toggleClass('c-hidden', !state);
            $('.folders_trainer_list').toggleClass('d-none', !state);

            $('.exs-edit-block').find('.btn-o-modal').parent().toggleClass('c-hidden', state);
            $('.exs-edit-block').find('.btn-edit-e[data-id="move"]').parent().toggleClass('c-hidden', state);
            $('.exs-edit-block').find('.btn-edit-e[data-id="trainer"]').parent().toggleClass('c-hidden', state);

            if (state) {
                $('#toggleFoldersViews').toggleClass('selected3', false);
                LoadAllTeamFolders();
                LoadFolderExercises();
            } else {
                $('#toggleFoldersViews').toggleClass('selected3', $('#toggleFoldersViews').attr('data-state') != '0');
                $('.exs-list-group').html('');
            }
            break;
        case "share":
            if ($('.exercises-list').find('.exs-elem.active').length <= 0) {
                $('.up-tabs-elem[data-id="share"]').removeClass('selected3');
                $('.up-tabs-elem[data-id="share"]').attr('data-state', '0');
                swal("Внимание", "Выберите упражнение из списка.", "info");
            } else {
                if (state) {$('#exerciseShareModal').modal('show');} 
                else {$('#exerciseShareModal').modal('hide');}
            }
            break;
        case "clear_filter":
            $('.up-block-content').find('.up-tabs-elem').attr('data-state', 0);
            $('.up-block-content').find('.up-tabs-elem').removeClass('selected3');
            ToggleIconsInExs();
            ToggleMarkersInExs();
            $('.exs-search').val('');
            $('.exs-age-filter').val('');
            $('.exs-players-filter').val('');
            window.exercisesFilter = {};
            LoadFolderExercises();
            CountExsInFolder();
            $('.up-tabs-elem[data-id="clear_filter"]').removeClass('selected3');
            $('.up-tabs-elem[data-id="clear_filter"]').attr('data-state', 0);
            break;
        case "toggle_watched":
            if (state) {
                $('.up-tabs-elem[data-id="toggle_watched_not"]').removeClass('selected3');
                $('.up-tabs-elem[data-id="toggle_watched_not"]').attr('data-state', '0');
                $('.up-tabs-elem[data-id="toggle_video"]').removeClass('selected3');
                $('.up-tabs-elem[data-id="toggle_video"]').attr('data-state', '0');
                $('.up-tabs-elem[data-id="toggle_animation"]').removeClass('selected3');
                $('.up-tabs-elem[data-id="toggle_animation"]').attr('data-state', '0');
                window.exercisesFilter['video_watched'] = '1';
                delete window.exercisesFilter['video_watched_not'];
                delete window.exercisesFilter['video_isvideo'];
                delete window.exercisesFilter['video_isanimation'];
                for (ind in window.count_exs_calls) {
                    window.count_exs_calls[ind]['call'].abort();
                }
                LoadFolderExercises();
                CountExsInFolder();
            } else {
                delete window.exercisesFilter['video_watched'];
                for (ind in window.count_exs_calls) {
                    window.count_exs_calls[ind]['call'].abort();
                }
                LoadFolderExercises();
                CountExsInFolder();
            }
            break;
        case "toggle_watched_not":
            if (state) {
                $('.up-tabs-elem[data-id="toggle_watched"]').removeClass('selected3');
                $('.up-tabs-elem[data-id="toggle_watched"]').attr('data-state', '0');
                $('.up-tabs-elem[data-id="toggle_video"]').removeClass('selected3');
                $('.up-tabs-elem[data-id="toggle_video"]').attr('data-state', '0');
                $('.up-tabs-elem[data-id="toggle_animation"]').removeClass('selected3');
                $('.up-tabs-elem[data-id="toggle_animation"]').attr('data-state', '0');
                window.exercisesFilter['video_watched_not'] = '1';
                delete window.exercisesFilter['video_watched'];
                delete window.exercisesFilter['video_isvideo'];
                delete window.exercisesFilter['video_isanimation'];
                for (ind in window.count_exs_calls) {
                    window.count_exs_calls[ind]['call'].abort();
                }
                LoadFolderExercises();
                CountExsInFolder();
            } else {
                delete window.exercisesFilter['video_watched_not'];
                for (ind in window.count_exs_calls) {
                    window.count_exs_calls[ind]['call'].abort();
                }
                LoadFolderExercises();
                CountExsInFolder();
            }
            break;
        case "toggle_video":
            if (state) {
                $('.up-tabs-elem[data-id="toggle_watched"]').removeClass('selected3');
                $('.up-tabs-elem[data-id="toggle_watched"]').attr('data-state', '0');
                $('.up-tabs-elem[data-id="toggle_watched_not"]').removeClass('selected3');
                $('.up-tabs-elem[data-id="toggle_watched_not"]').attr('data-state', '0');
                $('.up-tabs-elem[data-id="toggle_animation"]').removeClass('selected3');
                $('.up-tabs-elem[data-id="toggle_animation"]').attr('data-state', '0');
                window.exercisesFilter['video_isvideo'] = '1';
                delete window.exercisesFilter['video_watched'];
                delete window.exercisesFilter['video_watched_not'];
                delete window.exercisesFilter['video_isanimation'];
                for (ind in window.count_exs_calls) {
                    window.count_exs_calls[ind]['call'].abort();
                }
                LoadFolderExercises();
                CountExsInFolder();
            } else {
                delete window.exercisesFilter['video_isvideo'];
                for (ind in window.count_exs_calls) {
                    window.count_exs_calls[ind]['call'].abort();
                }
                LoadFolderExercises();
                CountExsInFolder();
            }
            break;
        case "toggle_animation":
            if (state) {
                $('.up-tabs-elem[data-id="toggle_watched"]').removeClass('selected3');
                $('.up-tabs-elem[data-id="toggle_watched"]').attr('data-state', '0');
                $('.up-tabs-elem[data-id="toggle_watched_not"]').removeClass('selected3');
                $('.up-tabs-elem[data-id="toggle_watched_not"]').attr('data-state', '0');
                $('.up-tabs-elem[data-id="toggle_video"]').removeClass('selected3');
                $('.up-tabs-elem[data-id="toggle_video"]').attr('data-state', '0');
                window.exercisesFilter['video_isanimation'] = '1';
                delete window.exercisesFilter['video_watched'];
                delete window.exercisesFilter['video_watched_not'];
                delete window.exercisesFilter['video_isvideo'];
                for (ind in window.count_exs_calls) {
                    window.count_exs_calls[ind]['call'].abort();
                }
                LoadFolderExercises();
                CountExsInFolder();
            } else {
                delete window.exercisesFilter['video_isanimation'];
                for (ind in window.count_exs_calls) {
                    window.count_exs_calls[ind]['call'].abort();
                }
                LoadFolderExercises();
                CountExsInFolder();
            }
            break;
        case "toggle_favorite":
            if (!state && !$('.up-tabs-elem[data-id="toggle_favorite"]').hasClass('filtering')) {
                $('.up-tabs-elem[data-id="toggle_favorite"]').addClass('filtering');
                $('.up-tabs-elem[data-id="toggle_favorite"]').addClass('selected3');
                $('.up-tabs-elem[data-id="toggle_favorite"]').attr('data-state', 1);
                window.exercisesFilter['favorite'] = '1';
                for (ind in window.count_exs_calls) {
                    window.count_exs_calls[ind]['call'].abort();
                }
                LoadFolderExercises();
                CountExsInFolder();
            } else if (!state && $('.up-tabs-elem[data-id="toggle_favorite"]').hasClass('filtering')) {
                $('.up-tabs-elem[data-id="toggle_favorite"]').removeClass('filtering');
                delete window.exercisesFilter['favorite'];
                for (ind in window.count_exs_calls) {
                    window.count_exs_calls[ind]['call'].abort();
                }
                LoadFolderExercises();
                CountExsInFolder();
            }
            ToggleMarkersInExs();
            break;
        case "goal":
            if (state) {
                $('.up-tabs-elem[data-id="goal"]').addClass('selected3');
                $('.up-tabs-elem[data-id="goal"]').attr('data-state', 1);
                window.exercisesFilter['goal'] = '1';
                for (ind in window.count_exs_calls) {
                    window.count_exs_calls[ind]['call'].abort();
                }
                LoadFolderExercises();
                CountExsInFolder();
            } else {
                delete window.exercisesFilter['goal'];
                for (ind in window.count_exs_calls) {
                    window.count_exs_calls[ind]['call'].abort();
                }
                LoadFolderExercises();
                CountExsInFolder();
            }
            break;
        case "players":
            ToggleIconsInExs();
            break;
        case "ball":
            if (state) {
                $('.up-tabs-elem[data-id="ball"]').addClass('selected3');
                $('.up-tabs-elem[data-id="ball"]').attr('data-state', 1);
                window.exercisesFilter['ball'] = '1';
                for (ind in window.count_exs_calls) {
                    window.count_exs_calls[ind]['call'].abort();
                }
                LoadFolderExercises();
                CountExsInFolder();
            } else {
                delete window.exercisesFilter['ball'];
                for (ind in window.count_exs_calls) {
                    window.count_exs_calls[ind]['call'].abort();
                }
                LoadFolderExercises();
                CountExsInFolder();
            }
            break;
        case "keywords":
            ToggleIconsInExs();
            break;
        case "toggle_new":
            if (state) {
                window.exercisesFilter['new_exs'] = '1';
                for (ind in window.count_exs_calls) {
                    window.count_exs_calls[ind]['call'].abort();
                }
                LoadFolderExercises();
                CountExsInFolder();
            } else {
                delete window.exercisesFilter['new_exs'];
                for (ind in window.count_exs_calls) {
                    window.count_exs_calls[ind]['call'].abort();
                }
                LoadFolderExercises();
                CountExsInFolder();
            }
            break;
        case "toggle_editing":
            if (state) {
                window.exercisesFilter['editing_exs'] = '1';
                for (ind in window.count_exs_calls) {
                    window.count_exs_calls[ind]['call'].abort();
                }
                LoadFolderExercises();
                CountExsInFolder();
            } else {
                delete window.exercisesFilter['editing_exs'];
                for (ind in window.count_exs_calls) {
                    window.count_exs_calls[ind]['call'].abort();
                }
                LoadFolderExercises();
                CountExsInFolder();
            }
            break;
        case "toggle_new_folder":
            if (state) {
                window.exercisesFilter['new_folder_exs'] = '1';
                for (ind in window.count_exs_calls) {
                    window.count_exs_calls[ind]['call'].abort();
                }
                LoadFolderExercises();
                CountExsInFolder();
            } else {
                delete window.exercisesFilter['new_folder_exs'];
                for (ind in window.count_exs_calls) {
                    window.count_exs_calls[ind]['call'].abort();
                }
                LoadFolderExercises();
                CountExsInFolder();
            }
            break;
        case "toggle_pro":
            if (state) {
                $('.up-tabs-elem[data-id="toggle_pro"]').addClass('selected3');
                $('.up-tabs-elem[data-id="toggle_pro"]').attr('data-state', 1);
                window.exercisesFilter['pro'] = '1';
                for (ind in window.count_exs_calls) {
                    window.count_exs_calls[ind]['call'].abort();
                }
                LoadFolderExercises();
                CountExsInFolder();
            } else {
                $('.up-tabs-elem[data-id="toggle_pro"]').removeClass('filtering');
                delete window.exercisesFilter['pro'];
                for (ind in window.count_exs_calls) {
                    window.count_exs_calls[ind]['call'].abort();
                }
                LoadFolderExercises();
                CountExsInFolder();
            }
            ToggleIconsInExs();
            break;
        case "toggle_u_big":
            if (state) {
                $('.up-tabs-elem[data-id="toggle_u_big"]').addClass('selected3');
                $('.up-tabs-elem[data-id="toggle_u_big"]').attr('data-state', 1);
                window.exercisesFilter['u_big'] = '1';
                for (ind in window.count_exs_calls) {
                    window.count_exs_calls[ind]['call'].abort();
                }
                LoadFolderExercises();
                CountExsInFolder();
            } else {
                $('.up-tabs-elem[data-id="toggle_u_big"]').removeClass('filtering');
                delete window.exercisesFilter['u_big'];
                for (ind in window.count_exs_calls) {
                    window.count_exs_calls[ind]['call'].abort();
                }
                LoadFolderExercises();
                CountExsInFolder();
            }
            break;
        case "toggle_field":
            ToggleIconsInExs();
            break;
        case "toggle_iq":
            ToggleIconsInExs();
            break;
        default:
            break;
    }
}

function CheckLastExs() {
    let dataStr = sessionStorage.getItem('last_exs');
    try {
        window.lastExercise = JSON.parse(dataStr);
    } catch(e) {}
    sessionStorage.setItem('last_exs', '');
    if (window.lastExercise && window.lastExercise.type) {
        $('.up-tabs-elem.folders-toggle').addClass('d-none');
        $('.up-tabs-elem.folders-toggle').removeClass('selected');
        $(`.up-tabs-elem[data-id="${window.lastExercise.type}"]`).removeClass('d-none');
        $(`.up-tabs-elem[data-id="${window.lastExercise.type}"]`).addClass('selected');
        $('.folders-block > div.folders-container > div.folders_div').addClass('d-none');
        $('.folders-block > div.folders-container > div.folders_div').removeClass('selected');
        $(`.folders-block > div.folders-container > div.folders_div[data-id="${window.lastExercise.type}"]`).removeClass('d-none');
        $(`.folders-block > div.folders-container > div.folders_div[data-id="${window.lastExercise.type}"]`).addClass('selected');
        setTimeout(() => {
            if (window.lastExercise.folder) {
                if (window.lastExercise.type == "team_folders") {
                    $('.folders_list').find(`.folder-elem[data-id="${window.lastExercise.folder}"]`).click();
                } else if (window.lastExercise.type == "nfb_folders") {
                    $('.folders_nfb_list').find(`.folder-nfb-elem[data-id="${window.lastExercise.folder}"]`).click();
                } else if (window.lastExercise.type == "club_folders") {
                    $('.folders_club_list').find(`.folder-club-elem[data-id="${window.lastExercise.folder}"]`).click();
                }
            }
        }, 200);
    } else {
        window.lastExercise = null;
    }
}

function RenderFilterNewExs() {
    function createElement(date, i) {
        const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
        let mm = String(date.getMonth() + 1).padStart(2, '0');
        let mmName =  monthNames[date.getMonth()];
        let yyyy = date.getFullYear();
        $('.list-group[data-id="newexs"]').append(`
            <li class="side-filter-elem list-group-item py-0 px-2" data-val="${i}">
                ${mmName} ${yyyy}
            </li>
        `);
    }
    let tDate = new Date();
    for (let i = 0; i < 6; i ++) {
        createElement(tDate, -i);
        tDate.setMonth(tDate.getMonth() - 1);
    }
}

function StopAllVideos() {
    try {
        if (Array.isArray(window.videoPlayerClones)) {
            for (let i = 0; i < window.videoPlayerClones.length; i++) {
                window.videoPlayerClones[i].pause();
            }
        }
    } catch (e) {}
}

function getFormattedDateFromTodayWithDelta(delta=0) {
    let date = new Date(new Date().getTime() + 24 * 60 * 60 * 1000 * delta);
    return date.getFullYear()
        + "-"
        + ("0" + (date.getMonth() + 1)).slice(-2)
        + "-"
        + ("0" + date.getDate()).slice(-2);
}

function LoadExerciseFullName() {
    let cId = $('#exerciseLangTitleModal').find('.modal-dialog[role="document"]').attr('data-exs');
    let folderType = $('.folders_div.selected').attr('data-id');
    let resData = {};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: {'get_exs_full_name': 1, 'exs': cId, 'f_type': folderType},
        type: 'GET', // GET или POST
        dataType: 'json',
        url: "/exercises/exercises_api",
        success: function (res) {
            if (res.success) {
                resData = res.data;
            }
        },
        error: function (res) {
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
            RenderExerciseFullName(resData);
        }
    });
}

function RenderExerciseFullName(data) {
    $('#exerciseLangTitleModal').find('input.exs-title').each((ind, elem) => {
        let langCode = $(elem).attr('data-lang');
        let cVal = "";
        try {
            cVal = data['title'][langCode];
        } catch(e) {}
        $(elem).val(cVal);
    });
    $('#exerciseLangTitleModal').find('div.exs-description').each((ind, elem) => {
        let langCode = $(elem).attr('data-lang');
        let cVal = "";
        try {
            cVal = data['description'][langCode];
        } catch(e) {}
        document.descriptionEditorAdmin[langCode].setData(cVal);
        $(elem).val(cVal);
    });
}

function SaveExerciseFullName(exsId, folderType, key, value, lang, additional={}) {
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: {'edit_exs_full_name': 1, 'exs': exsId, 'f_type': folderType, key, value, lang},
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "exercises_api",
        success: function (res) {
            if (res.success) {
                if ('lang' in additional && 'value' in additional) {
                    SaveExerciseFullName(exsId, folderType, key, additional['value'], additional['lang']);
                } else {
                    swal("Готово", "Упражнение успешно изменено.", "success");
                }
            } else {
                swal("Ошибка", `При изменении упражнения произошла ошибка (${res.err}).`, "error");
            }
        },
        error: function (res) {
            swal("Ошибка", "Упражнение не удалось создать / изменить.", "error");
        },
        complete: function (res) {
            if (!('lang' in additional && 'value' in additional)) {
                $('.page-loader-wrapper').fadeOut();
            }
        }
    });
}

function ToggleTagsView() {
    let cId = $('.tags-filter-block').find('.toggle-tags-view.active').attr('data-id');
    let folderType = $('.folders_div.selected').attr('data-id');
    $('.tags-filter-block').find('.list-group[data-t="self"]').find('.side-filter-elem').toggleClass('t-hidden', folderType == "nfb_folders");
    $('.tags-filter-block').find('.list-group[data-t="self"]').find('.side-filter-elem').toggleClass('d-none', folderType == "nfb_folders");
    $('.tags-filter-block').find('.tag-header[data-t="self"]').toggleClass('t-hidden', folderType == "nfb_folders");
    $('.tags-filter-block').find('.tag-header[data-t="self"]').toggleClass('d-none', folderType == "nfb_folders");
    if (cId == "list") {
        $('.tags-filter-block').find('.side-filter-elem:not(.t-hidden)').removeClass('d-none');
        $('.tags-filter-block').find('.tag-header:not(.t-hidden)').addClass('d-none');
    } else if (cId == "headers") {
        $('.tags-filter-block').find('.side-filter-elem:not(.t-hidden)').addClass('d-none');
        $('.tags-filter-block').find('.tag-header:not(.t-hidden)').removeClass('d-none');
    }
}

function ToggleLangsRowsInModal() {
    let langs = $($('#exerciseLangTitleModal').find('select.toggle-langs')).val();
    $('#exerciseLangTitleModal').find(`tr`).addClass('d-none');
    langs.forEach(lang => {
        $('#exerciseLangTitleModal').find(`tr[data-lang="${lang}"]`).removeClass('d-none');
    });
}

function LoadContentInCardModalForEdit(id = -1, f_type="team_folders") {
    let data = {'get_exs_graphic_content': 1, 'exs': id, 'f_type': f_type};
    let resData = null;
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: data,
        type: 'GET', // GET или POST
        dataType: 'json',
        url: "/exercises/exercises_api",
        success: function (res) {
            if (res.success) {
                resData = res.data;
            }
        },
        error: function (res) {
            console.log(res);
        },
        complete: function (res) {
            RenderContentInCardModalForEdit(resData);
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function RenderContentInCardModalForEdit(data) {
    $('#exerciseCopyModal').find('.toggle-mode').css('display', 'inline-block');
    $('#exerciseCopyModal').find('.graphics-content').html('');
    if (data && data.scheme_1 && data.scheme_1 != "") {
        $('#exerciseCopyModal').find('.graphics-content[data-id="scheme_1"]').html(`
            <div class="col-12">
                <div class="tempimg">
                    <svg class="d-block bg-success mx-auto" height="100%" id="block" preserveAspectRatio="none" style="" viewBox="0 0 600 400" width="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <marker fill="#000000" id="arrow" markerHeight="12" markerUnits="userSpaceOnUse" markerWidth="15" orient="auto" refX="1" refY="6"><polyline points="1 1, 16 5.5, 1 12"></polyline></marker>
                            <marker fill="#ffffff" id="ffffffarrow" markerHeight="12" markerUnits="userSpaceOnUse" markerWidth="15" orient="auto" refX="1" refY="6"><polyline points="1 1, 16 5.5, 1 12"></polyline></marker>
                            <marker fill="#ffff00" id="ffff00arrow" markerHeight="12" markerUnits="userSpaceOnUse" markerWidth="15" orient="auto" refX="1" refY="6"><polyline points="1 1, 16 5.5, 1 12"></polyline></marker>
                            <marker fill="#ff0000" id="ff0000arrow" markerHeight="12" markerUnits="userSpaceOnUse" markerWidth="15" orient="auto" refX="1" refY="6"><polyline points="1 1, 16 5.5, 1 12"></polyline></marker>
                            <marker fill="#000000" id="000000arrow" markerHeight="12" markerUnits="userSpaceOnUse" markerWidth="15" orient="auto" refX="1" refY="6"><polyline points="1 1, 16 5.5, 1 12"></polyline></marker>
                            <filter height="200%" id="f3" width="200%" x="0" y="0"><feOffset dx="5" dy="5" in="SourceAlpha" result="offOut"></feOffset><feGaussianBlur in="offOut" result="blurOut" stdDeviation="3"></feGaussianBlur><feBlend in="SourceGraphic" in2="blurOut" mode="normal"></feBlend></filter>
                        </defs>
                        <image data-height="400" data-width="600" height="100%" href="/static/schemeDrawer/img/plane/f01.svg" id="plane" width="100%" x="0" y="0"></image>
                        <g id="selects"></g>
                        <g id="figures"></g>
                        <g id="lines"></g>
                        <g id="objects"></g>
                        <g id="dots"></g>
                        <line id="xLine" stroke="red" stroke-dasharray="10" stroke-width="1" x1="-1" x2="-1" y1="0" y2="1600"></line>
                        <line id="yLine" stroke="red" stroke-dasharray="10" stroke-width="1" x1="0" x2="2400" y1="-1" y2="-1"></line>
                        <line id="xLine2" stroke="red" stroke-dasharray="10" stroke-width="1" x1="-2400" x2="-2400" y1="0" y2="1600"></line>
                        <line id="yLine2" stroke="red" stroke-dasharray="10" stroke-width="1" x1="0" x2="2400" y1="-1600" y2="-1600"></line>
                    </svg>
                </div>
                <img class="img-lazyload d-none" src="https://nanofootballdraw.ru/api/canvas-draw/v1/canvas/render?id=${data.scheme_1}" alt="scheme" width="100%" height="100%"> 
            </div>
        `);
    } else if (data && data.scheme_data && data.scheme_data[0]) {
        $('#exerciseCopyModal').find('.graphics-content[data-id="scheme_1"]').html(`
            ${data.scheme_data[0]}
        `);
    } else {
        $('#exerciseCopyModal').find('.toggle-mode[data-id="copy-scheme-1"]').css('display', 'none');
    }
    if (data && data.scheme_2 && data.scheme_2 != "") {
        $('#exerciseCopyModal').find('.graphics-content[data-id="scheme_2"]').html(`
            <div class="col-12">
                <div class="tempimg">
                    <svg class="d-block bg-success mx-auto" height="100%" id="block" preserveAspectRatio="none" style="" viewBox="0 0 600 400" width="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <marker fill="#000000" id="arrow" markerHeight="12" markerUnits="userSpaceOnUse" markerWidth="15" orient="auto" refX="1" refY="6"><polyline points="1 1, 16 5.5, 1 12"></polyline></marker>
                            <marker fill="#ffffff" id="ffffffarrow" markerHeight="12" markerUnits="userSpaceOnUse" markerWidth="15" orient="auto" refX="1" refY="6"><polyline points="1 1, 16 5.5, 1 12"></polyline></marker>
                            <marker fill="#ffff00" id="ffff00arrow" markerHeight="12" markerUnits="userSpaceOnUse" markerWidth="15" orient="auto" refX="1" refY="6"><polyline points="1 1, 16 5.5, 1 12"></polyline></marker>
                            <marker fill="#ff0000" id="ff0000arrow" markerHeight="12" markerUnits="userSpaceOnUse" markerWidth="15" orient="auto" refX="1" refY="6"><polyline points="1 1, 16 5.5, 1 12"></polyline></marker>
                            <marker fill="#000000" id="000000arrow" markerHeight="12" markerUnits="userSpaceOnUse" markerWidth="15" orient="auto" refX="1" refY="6"><polyline points="1 1, 16 5.5, 1 12"></polyline></marker>
                            <filter height="200%" id="f3" width="200%" x="0" y="0"><feOffset dx="5" dy="5" in="SourceAlpha" result="offOut"></feOffset><feGaussianBlur in="offOut" result="blurOut" stdDeviation="3"></feGaussianBlur><feBlend in="SourceGraphic" in2="blurOut" mode="normal"></feBlend></filter>
                        </defs>
                        <image data-height="400" data-width="600" height="100%" href="/static/schemeDrawer/img/plane/f01.svg" id="plane" width="100%" x="0" y="0"></image>
                        <g id="selects"></g>
                        <g id="figures"></g>
                        <g id="lines"></g>
                        <g id="objects"></g>
                        <g id="dots"></g>
                        <line id="xLine" stroke="red" stroke-dasharray="10" stroke-width="1" x1="-1" x2="-1" y1="0" y2="1600"></line>
                        <line id="yLine" stroke="red" stroke-dasharray="10" stroke-width="1" x1="0" x2="2400" y1="-1" y2="-1"></line>
                        <line id="xLine2" stroke="red" stroke-dasharray="10" stroke-width="1" x1="-2400" x2="-2400" y1="0" y2="1600"></line>
                        <line id="yLine2" stroke="red" stroke-dasharray="10" stroke-width="1" x1="0" x2="2400" y1="-1600" y2="-1600"></line>
                    </svg>
                </div>
                <img class="img-lazyload d-none" src="https://nanofootballdraw.ru/api/canvas-draw/v1/canvas/render?id=${data.scheme_2}" alt="scheme" width="100%" height="100%"> 
            </div>
        `);
    } else if (data && data.scheme_data && data.scheme_data[1]) {
        $('#exerciseCopyModal').find('.graphics-content[data-id="scheme_2"]').html(`
            ${data.scheme_data[1]}
        `);
    } else {
        $('#exerciseCopyModal').find('.toggle-mode[data-id="copy-scheme-2"]').css('display', 'none');
    }
    $('#exerciseCopyModal').find('.img-lazyload').each((index, elem) => {
        $(elem).on('load', (e) => {
            $(e.currentTarget).removeClass('d-none');
            $(e.currentTarget).prev().addClass('d-none');
        });
    });
    if (data && data.video_1 && data.video_1.id != -1) {
        $('#exerciseCopyModal').find('.graphics-content[data-id="video_1"]').html(`
            <div class="col-12">
            ${'nftv' in data.video_1['links'] && data.video_1['links']['nftv'] != '' ? `
                <video id="video-player-modal-copy-0" class="video-js resize-block video-copy-modal" poster="https://nanofootball.pro/video/poster/${data.video_1['links']['nftv']}">
                    <source src="https://nanofootball.pro/video/player/${data.video_1['links']['nftv']}" type="video/mp4" />
                </video>
            ` : 'youtube' in data.video_1['links'] && data.video_1['links']['youtube'] != '' ? `
                <video id="video-player-modal-copy-0" class="video-js resize-block video-copy-modal" poster="">
                    <source src="https://www.youtube.com/watch?v=${data.video_1['links']['youtube']}" type="video/youtube" />
                </video>
            ` : ''}
            </div>
        `);
    } else {
        $('#exerciseCopyModal').find('.toggle-mode[data-id="move-video-1"]').css('display', 'none');
    }
    // if (data && data.video_2 && data.video_2.id != -1) {
    //     $('#exerciseCopyModal').find('.graphics-content[data-id="video_2"]').html(`
    //         <div class="col-12">
    //         ${'nftv' in data.video_2['links'] && data.video_2['links']['nftv'] != '' ? `
    //             <video id="video-player-modal-copy-1" class="video-js resize-block video-copy-modal" poster="https://nanofootball.pro/video/poster/${data.video_2['links']['nftv']}">
    //                 <source src="https://nanofootball.pro/video/player/${data.video_2['links']['nftv']}" type="video/mp4" />
    //             </video>
    //         ` : 'youtube' in data.video_2['links'] && data.video_2['links']['youtube'] != '' ? `
    //             <video id="video-player-modal-copy-1" class="video-js resize-block video-copy-modal" poster="">
    //                 <source src="https://www.youtube.com/watch?v=${data.video_2['links']['youtube']}" type="video/youtube" />
    //             </video>
    //         ` : ''}м
    //         </div>
    //     `);
    // } else {
    //     $('#exerciseCopyModal').find('.toggle-mode[data-id="move-video-2"]').css('display', 'none');
    // }
    if (data && data.animation_1 && data.animation_1.id != -1) {
        $('#exerciseCopyModal').find('.graphics-content[data-id="animation_1"]').html(`
            <div class="col-12">
            ${'nftv' in data.animation_1['links'] && data.animation_1['links']['nftv'] != '' ? `
                <video id="video-player-modal-copy-2" class="video-js resize-block video-copy-modal" poster="https://nanofootball.pro/video/poster/${data.animation_1['links']['nftv']}">
                    <source src="https://nanofootball.pro/video/player/${data.animation_1['links']['nftv']}" type="video/mp4" />
                </video>
            ` : 'youtube' in data.animation_1['links'] && data.animation_1['links']['youtube'] != '' ? `
                <video id="video-player-modal-copy-2" class="video-js resize-block video-copy-modal" poster="">
                    <source src="https://www.youtube.com/watch?v=${data.animation_1['links']['youtube']}" type="video/youtube" />
                </video>
            ` : ''}
            </div>
        `);
    } else {
        $('#exerciseCopyModal').find('.toggle-mode[data-id="move-animation-1"]').css('display', 'none');
    }
    // if (data && data.animation_2 && data.animation_2.id != -1) {
    //     $('#exerciseCopyModal').find('.graphics-content[data-id="animation_2"]').html(`
    //         <div class="col-12">
    //         ${'nftv' in data.animation_2['links'] && data.animation_2['links']['nftv'] != '' ? `
    //             <video id="video-player-modal-copy-3" class="video-js resize-block video-copy-modal" poster="https://nanofootball.pro/video/poster/${data.animation_2['links']['nftv']}">
    //                 <source src="https://nanofootball.pro/video/player/${data.animation_2['links']['nftv']}" type="video/mp4" />
    //             </video>
    //         ` : 'youtube' in data.animation_2['links'] && data.animation_2['links']['youtube'] != '' ? `
    //             <video id="video-player-modal-copy-3" class="video-js resize-block video-copy-modal" poster="">
    //                 <source src="https://www.youtube.com/watch?v=${data.animation_2['links']['youtube']}" type="video/youtube" />
    //             </video>
    //         ` : ''}
    //         </div>
    //     `);
    // } else {
    //     $('#exerciseCopyModal').find('.toggle-mode[data-id="move-animation-2"]').css('display', 'none');
    // }
    if (!window.videoPlayerCopyClones) {
        window.videoPlayerCopyClones = [];
    }
    try {
        for (let i = 0; i < window.videoPlayerCopyClones.length; i++) {
            window.videoPlayerCopyClones[i].dispose();
        }
    } catch(e) {}
    let items = $('#exerciseCopyModal').find('.video-copy-modal');
    for (let i = 0; i < items.length; i++) {
        let tId = $(items[i]).attr('id');
        window.videoPlayerCopyClones[i] = videojs($('#exerciseCopyModal').find(`#${tId}`)[0], {
            preload: 'auto',
            autoplay: false,
            controls: true,
            aspectRatio: '16:9',
            youtube: { "iv_load_policy": 1, 'modestbranding': 1, 'rel': 0, 'showinfo': 0, 'controls': 0 },
        });
    }
    for (let i = 0; i < items.length; i++) {
        window.videoPlayerCopyClones[i].load();
    }
}

function IsSelectedExercisesForDelete(clearList = false) {
    let isSelected = false;
    try {
        isSelected = window.selectedExercisesForDelete.length > 0;
    } catch(e) {}
    if (isSelected && clearList) {
        window.selectedExercisesForDelete = [];
        RenderSelectedExercisesForDelete();
    }
    return isSelected;
}

function RenderSelectedExercisesForDelete() {
    $('.exs-list-group').find('.exs-elem').find('.title > .delete-icon').remove();
    try {
        for (let i = 0; i < window.selectedExercisesForDelete.length; i++) {
            let tID = window.selectedExercisesForDelete[i];
            $('.exs-list-group').find(`.exs-elem[data-id="${tID}"]`).find('.title').prepend(`
                <span class="delete-icon mr-2">
                    <i class="fa fa-trash-o" aria-hidden="true"></i>
                </span>
            `);
        }
    } catch(e) {}
    let amount = 0;
    try {
        amount = window.selectedExercisesForDelete.length;
    } catch(e) {}
    $('.exs-edit-block').find('.btn-edit-e[data-id="delete_select"]').find('.amount').text(`(${amount})`);
}

function MoveVideoFromExsToExs(toExsId) {
    let data = {
        'move_video_from_exs_to_exs': 1, 
        'from_exs': window.moveVideoFromExsToExs['exs_from'], 
        'to_exs': toExsId, 
        'content': window.moveVideoFromExsToExs['content']
    };
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: data,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "exercises_api",
        success: function (res) {
            if (res.success) {
                swal("Готово", "Видео / анимация успешно перенесены.", "success");
                LoadExerciseOneHandler();
            } else {
                swal("Ошибка", "Не удалось переместить видео / анимацию.", "error");
                console.log(res);
            }
        },
        error: function (res) {
            swal("Ошибка", "Не удалось переместить видео / анимацию.", "error");
            console.log(res);
        },
        complete: function (res) {
        }
    });
}

function CopySchemeFromExsToExs(toExsId, toFolderType) {
    let data = {
        'copy_scheme_from_exs_to_exs': 1, 
        'from_exs': window.copySchemeFromExsToExs['exs_from'], 
        'to_exs': toExsId, 
        'from_f_type': window.copySchemeFromExsToExs['f_type'],
        'to_f_type': toFolderType,
        'content': window.copySchemeFromExsToExs['content']
    };
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: data,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "exercises_api",
        success: function (res) {
            if (res.success) {
                swal("Готово", "Схема успешно скопирована.", "success");
                LoadExerciseOneHandler();
            } else {
                swal("Ошибка", "Не удалось скопировать схему.", "error");
                console.log(res);
            }
        },
        error: function (res) {
            swal("Ошибка", "Не удалось скопировать схему.", "error");
            console.log(res);
        },
        complete: function (res) {
        }
    });
}

function fallbackCopyTextToClipboard(text) {
    let textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
    }
    document.body.removeChild(textArea);
}

function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
    }
    navigator.clipboard.writeText(text).then(function() {
        console.log('Async: Copying to clipboard was successful!');
    }, function(err) {
        console.error('Async: Could not copy text: ', err);
    });
}

function CountTrainerExercises() {
    let data = {'count_exs': 1, 'type': "__is_trainer", 'filter': {}};
    let folder = $('.exs-edit-block').find('.btn-edit-e[data-id="trainer"]');
    CountExsAjaxReq(data, folder);
}

function LoadAllTeamFolders() {
    if ($('.folders_trainer_list').find('.trainer-folder-elem').length > 0) {return;}
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: {'all_team_folders': 1},
        type: 'GET', // GET или POST
        dataType: 'json',
        url: "/exercises/folders_api",
        success: function (res) {
            if (res.success) {
                let htmlFolders = "";
                const shortNameChars = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
                res.data.forEach(row => {
                    htmlFolders += `
                        <li class="list-group-item p-1 last-elem team-elem">
                            <div class="trainer-folder-elem-team" data-team="${row.team.id}">
                                <div class="pull-center d-flex justify-content-center">
                                    <span class="folder-title">Команда: ${row.team.name}</span>
                                </div>
                            </div>
                        </li>
                    `;
                    row.folders.forEach((folder, folder_i) => {
                        folder.subfolders.forEach((subfolder, subfolder_i) => {
                            let isLastElem = subfolder_i == folder.subfolders.length-1;
                            let shortName = `${shortNameChars[folder_i].toUpperCase()}${subfolder_i+1}`;
                            htmlFolders += `
                                <li class="list-group-item p-1 ${isLastElem ? 'last-elem' : ''}">
                                    <div class="trainer-folder-elem d-flex justify-content-between" data-id="${subfolder.id}" data-parent="${folder.id}" data-team="${row.team.id}">
                                        <div class="pull-left">
                                            <span class="folder-title">${shortName}. ${subfolder.name}</span>
                                        </div>
                                    </div>
                                </li>
                            `;
                        });
                    });
                });
                $('.folders_trainer_list').find('ul').html(htmlFolders);
            }
        },
        error: function (res) {
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function ToggleExerciseToArchive(elem, exsId, folderType, state) {
    if (state == '0') {
        let data = {
            'copy_exs': 1,
            'move_mode': 'solo',
            'exs': exsId, 
            'nfb_folder': 0, 
            'folder': "__is_trainer",
            'type': folderType
        };
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            headers:{"X-CSRFToken": csrftoken},
            data: data,
            type: 'POST', // GET или POST
            dataType: 'json',
            url: "exercises_api",
            success: function (res) {
                if (res.success) {
                    $(elem).find('button[data-type="marker"][data-id="trainer"]').attr('data-val', '1');
                    $(elem).find('button[data-type="marker"][data-id="trainer"]').attr('title', "Убрать из архива");
                    $(elem).find('button[data-type="marker"][data-id="trainer"]').find('i').css('opacity', '1');
                    swal("Готово", "Упражнение добавлено в Архив.", "success");
                } else {
                    swal("Ошибка", "Упражнение не удалось добавить в Архив.", "error");
                    console.log(res);
                }
            },
            error: function (res) {
                if (res.responseJSON && res.responseJSON.code && res.responseJSON.code == "limit") {
                    swal("Ошибка", `Упражнение не удалось добавить в Архив. Превышен лимит упражений в папке (максимум: ${res.responseJSON.value}).`, "error");
                } else {
                    swal("Ошибка", "Упражнение не удалось добавить в Архив.", "error");
                }
                console.log(res);
            },
            complete: function (res) {
                $('.page-loader-wrapper').fadeOut();
            }
        });
    } else if (state == '1') {
        swal({
            title: "Вы точно хотите удалить упражнение из архива?",
            icon: "warning",
            buttons: ["Отмена", "Подтвердить"],
            dangerMode: true,
        })
        .then((willDelete) => {
            if (willDelete) {
                let data = {'delete_exs': 1, 'exs': exsId, 'exs_ref': -1, 'type': folderType};
                if (folderType != "__is_trainer") {
                    data['type'] = "__is_trainer";
                    data['exs_ref'] = exsId;
                }
                $('.page-loader-wrapper').fadeIn();
                $.ajax({
                    headers:{"X-CSRFToken": csrftoken},
                    data: data,
                    type: 'POST', // GET или POST
                    dataType: 'json',
                    url: "exercises_api",
                    success: function (res) {
                        if (res.success) {
                            swal("Готово", "Упражнение успешно удалено из Архива.", "success")
                            .then((value) => {
                                LoadFolderExercises();
                                $('.page-loader-wrapper').fadeIn();
                            });
                        }
                    },
                    error: function (res) {
                        swal("Ошибка", "Упражнение удалить не удалось из Архива.", "error");
                        console.log(res);
                    },
                    complete: function (res) {
                        $('.page-loader-wrapper').fadeOut();
                    }
                });
            }
        });
    }
}



$(function() {

    $('.folders_list').toggleClass('d-none', true);
    $('.folders_nfb_list').toggleClass('d-none', false);
    $('.folders_club_list').toggleClass('d-none', false);


    // Load team folder's name to button
    let selectedTeam = $('#select-team').val();
    if (selectedTeam && selectedTeam != "") {
        let tText = $('#select-team').find(`option[value="${selectedTeam}"]`).text();
        $('.up-block-content').find('.folders-toggle[data-id="team_folders"]').find('span').first().text(`ПАПКИ "${tText}"`);
        $('.folders-container').find('.folders-toggle[data-id="team_folders"]').find('span').first().text(`ПАПКИ "${tText}"`);
    }


    // Toggle upper buttons panel
    $('button.up-tabs-elem').on('click', (e) => {
        if ($(e.currentTarget).hasClass('up-tab-custom')) {return;}
        let id = $(e.currentTarget).attr('data-id');
        let state = $(e.currentTarget).attr('data-state') == '1';
        $(e.currentTarget).toggleClass('selected3', !state);
        $(e.currentTarget).attr('data-state', state ? '0' : '1');
        ToggleUpFilter(id, !state);
    });


    // Toggle side filter elements
    $('.side-filter-block').on('click', '.side-filter-elem', (e) => {
        let state = $(e.currentTarget).attr('data-state') == '1';
        let isFilter = $(e.currentTarget).parent().attr('data-id') == "filter";
        let isVideoSources = $(e.currentTarget).parent().attr('data-id') == "video_sources";
        if (isFilter) {
            $('.side-filter-block').find('.list-group[data-id="filter"]').find('.side-filter-elem').attr('data-state', '0');
            $('.side-filter-block').find('.list-group[data-id="filter"]').find('.side-filter-elem').toggleClass('active', false);
            $('.side-filter-block').find('.list-group[data-id="filter"]').find('.side-filter-elem').find('.row > div:nth-child(2)').html('');
            let type = $(e.currentTarget).attr('data-type');
            let id = $(e.currentTarget).attr('data-id');
            if (!state) {
                $(e.currentTarget).find('.row > div:nth-child(2)').html(`<div class="lds-ring"><div></div><div></div><div></div><div></div></div>`);
                window.exercisesFilter[type] = id;
            } else {
                $(e.currentTarget).find('.row > div:nth-child(2)').html('');
                delete window.exercisesFilter[type];
            }
            for (ind in window.count_exs_calls) {
                window.count_exs_calls[ind]['call'].abort();
            }
            LoadFolderExercises();
            CountExsInFolder();
        } else if (isVideoSources) {
            $('.side-filter-block').find('.list-group[data-id="video_sources"]').find('.side-filter-elem').attr('data-state', '0');
            $('.side-filter-block').find('.list-group[data-id="video_sources"]').find('.side-filter-elem').toggleClass('active', false);
            $('.side-filter-block').find('.list-group[data-id="video_sources"]').find('.side-filter-elem').find('.row > div:nth-child(2)').html('');
            let type = $(e.currentTarget).attr('data-type');
            let id = $(e.currentTarget).attr('data-id');
            if (!state) {
                $(e.currentTarget).find('.row > div:nth-child(2)').html(`<div class="lds-ring"><div></div><div></div><div></div><div></div></div>`);
                window.exercisesFilter[type] = id;
            } else {
                $(e.currentTarget).find('.row > div:nth-child(2)').html('');
                delete window.exercisesFilter[type];
            }
            for (ind in window.count_exs_calls) {
                window.count_exs_calls[ind]['call'].abort();
            }
            LoadFolderExercises();
            CountExsInFolder();
        }
        $(e.currentTarget).toggleClass('active', !state);
        $(e.currentTarget).attr('data-state', state ? '0' : '1');
    });
    $('.tags-filter-block').on('click', '.side-filter-elem', (e) => {
        let state = $(e.currentTarget).attr('data-state') == '1';
        let isTags = true;
        if (isTags) {
            let type = $(e.currentTarget).attr('data-type');
            let id = $(e.currentTarget).attr('data-id');
            if (!state) {
                if (!Array.isArray(window.exercisesFilter[type])) {
                    window.exercisesFilter[type] = [];
                }
                window.exercisesFilter[type].push(id);
            } else {
                if (!Array.isArray(window.exercisesFilter[type])) {
                    window.exercisesFilter[type] = [];
                }
                let index = window.exercisesFilter[type].indexOf(id);
                if (index !== -1) {
                    window.exercisesFilter[type].splice(index, 1);
                }
            }
            for (ind in window.count_exs_calls) {
                window.count_exs_calls[ind]['call'].abort();
            }
            LoadFolderExercises();
            CountExsInFolder();
        }
        $(e.currentTarget).toggleClass('active', !state);
        $(e.currentTarget).attr('data-state', state ? '0' : '1');
    });

    let searchTmpVal = "";
    $('.exs-search').on('keyup', (e) => {
        let val = $(e.currentTarget).val();
        console.log( val, window.exercisesFilter['_search'] )
        if ((window.exercisesFilter['_search'] && window.exercisesFilter['_search'] == val) || (!window.exercisesFilter['_search'] && val == "")) {
            return;
        }
        setTimeout(() => {
            let waitedVal = $('.exs-search').val();
            if ((val == waitedVal || waitedVal == "") && waitedVal != searchTmpVal) {
                searchTmpVal = waitedVal;
                window.exercisesFilter['_search'] = searchTmpVal;
                for (ind in window.count_exs_calls) {
                    window.count_exs_calls[ind]['call'].abort();
                }
                LoadFolderExercises();
                CountExsInFolder();
            }
        }, 500);
    });
    let ageTmpVal = "";
    $('.exs-age-filter').on('keyup', (e) => {
        let val = $(e.currentTarget).val();
        if ((window.exercisesFilter['filter_age'] && window.exercisesFilter['filter_age'] == val) || (!window.exercisesFilter['filter_age'] && val == "")) {
            return;
        }
        setTimeout(() => {
            let waitedVal = $('.exs-age-filter').val();
            if ((val == waitedVal || waitedVal == "") && waitedVal != ageTmpVal) {
                ageTmpVal = waitedVal;
                window.exercisesFilter['filter_age'] = ageTmpVal;
                for (ind in window.count_exs_calls) {
                    window.count_exs_calls[ind]['call'].abort();
                }
                LoadFolderExercises();
                CountExsInFolder();
            }
        }, 500);
    });
    let playersTmpVal = "";
    $('.exs-players-filter').on('keyup', (e) => {
        let val = $(e.currentTarget).val();
        if ((window.exercisesFilter['filter_players'] && window.exercisesFilter['filter_players'] == val) || (!window.exercisesFilter['filter_players'] && val == "")) {
            return;
        }
        setTimeout(() => {
            let waitedVal = $('.exs-players-filter').val();
            if ((val == waitedVal || waitedVal == "") && waitedVal != playersTmpVal) {
                playersTmpVal = waitedVal;
                window.exercisesFilter['filter_players'] = playersTmpVal;
                for (ind in window.count_exs_calls) {
                    window.count_exs_calls[ind]['call'].abort();
                }
                LoadFolderExercises();
                CountExsInFolder();
            }
        }, 500);
    });


    // Toggle side filter content
    $('.side-filter-block').on('click', '.toggle-filter-content', (e) => {
        let cId = $(e.currentTarget).attr('data-id');
        $('.side-filter-block').find(`.list-group[data-id="${cId}"]`).toggleClass('d-none');
    });
    $('.tags-filter-block').on('click', '.toggle-filter-content', (e) => {
        let cId = $(e.currentTarget).attr('data-id');
        $('.tags-filter-block').find(`.list-group[data-id="${cId}"]:not(.t-hidden)`).find('.side-filter-elem').toggleClass('d-none');
    });


    // Toggle columns size
    $('#columnsSizeInCard').on('click', (e) => {
        $('#exerciseCardModal').find('div.gutter').toggleClass('d-none');
    });


    // Toggle Names of folders:
    $('#toggleFoldersNames').on('click', (e) => {
        ToggleFoldersNames();
    });


    $('#changeColumnSize').on('click', (e) => {
        try {
            let sizes = window.split.getSizes();
            let differVal = 6.4;
            if (Array.isArray(sizes) && sizes.length == 2) {
                if (sizes[0] - differVal > 10) {
                    sizes[0] -= differVal;
                    sizes[1] += differVal;
                } else {
                    sizes[0] = 51.8; sizes[1] = 38.2;
                }
                window.split.setSizes(sizes);
                localStorage.setItem('split_cols', JSON.stringify(sizes));
            }
        } catch(e) {}
    });


    $('#toggleExsAdminOptions').on('click', (e) => {
        let state = $(e.currentTarget).attr('data-state') == '1';
        $(e.currentTarget).attr('data-state', state ? '0' : '1');
        $(e.currentTarget).toggleClass('selected2', !state);
        ToggleIconsInExs();
    });
    $('#toggleExsID').on('click', (e) => {
        let state = $(e.currentTarget).attr('data-state') == '1';
        $(e.currentTarget).attr('data-state', state ? '0' : '1');
        $(e.currentTarget).toggleClass('selected2', !state);
        ToggleIconsInExs();
    });
    $('#toggleExsLangName').on('click', (e) => {
        let state = $(e.currentTarget).attr('data-state') == '1';
        $(e.currentTarget).attr('data-state', state ? '0' : '1');
        $(e.currentTarget).toggleClass('selected2', !state);
        ToggleIconsInExs();
    });
    $('#changeAllExsLangInFolder').on('click', (e) => {
        let folder = $('.folders-block').find('.list-group-item.active > div');
        if (folder.length > 0) {
            let cLangCode = $('#select-language').val();
            $('#exercisesChangeLangTitleModal').find('select[name="current_language"]').val(cLangCode);
            $('#exercisesChangeLangTitleModal').modal('show');
        } else {
            swal("Внимание", "Выберите папку с упражнениями.", "info");
        }
    });
    $('#exercisesChangeLangTitleModal').on('click', '.btn-move', (e) => {
        let folderType = $('.folders_div.selected').attr('data-id');
        let folder = $('.folders-block').find('.list-group-item.active > div').attr('data-id');
        let newLangCode =  $('#exercisesChangeLangTitleModal').find('select[name="new_language"]').val();
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            headers:{"X-CSRFToken": csrftoken},
            data: {'edit_all_exs_titles': 1, 'f_type': folderType, folder, 'lang': newLangCode, 'to_copy': 0},
            type: 'POST', // GET или POST
            dataType: 'json',
            url: "exercises_api",
            success: function (res) {
                if (res.success) {
                    swal("Готово", "Упражнения изменены.", "success");
                    $('#exercisesChangeLangTitleModal').modal('hide');
                } else {
                    swal("Ошибка", `При изменении упражнений произошла ошибка (${res.err}).`, "error");
                }
            },
            error: function (res) {
                swal("Ошибка", "Упражнения не удалось изменить!", "error");
                console.log(res);
            },
            complete: function (res) {
                $('.page-loader-wrapper').fadeOut();
            }
        });
    });
    $('#exercisesChangeLangTitleModal').on('click', '.btn-copy', (e) => {
        let folderType = $('.folders_div.selected').attr('data-id');
        let folder = $('.folders-block').find('.list-group-item.active > div').attr('data-id');
        let newLangCode =  $('#exercisesChangeLangTitleModal').find('select[name="new_language"]').val();
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            headers:{"X-CSRFToken": csrftoken},
            data: {'edit_all_exs_titles': 1, 'f_type': folderType, folder, 'lang': newLangCode, 'to_copy': 1},
            type: 'POST', // GET или POST
            dataType: 'json',
            url: "exercises_api",
            success: function (res) {
                if (res.success) {
                    swal("Готово", "Упражнения изменены.", "success");
                    $('#exercisesChangeLangTitleModal').modal('hide');
                } else {
                    swal("Ошибка", `При изменении упражнений произошла ошибка (${res.err}).`, "error");
                }
            },
            error: function (res) {
                swal("Ошибка", "Упражнения не удалось изменить!", "error");
                console.log(res);
            },
            complete: function (res) {
                $('.page-loader-wrapper').fadeOut();
            }
        });
    });
    

    // Toggle draw, video, animation
    $('.visual-block').on('click', '.graphics-block-toggle', (e) => {
        let cId = $(e.currentTarget).attr('data-id');
        $('.visual-block').find('.graphics-block-toggle').removeClass('selected');
        $(e.currentTarget).addClass('selected');
        $('.visual-block').find('.graphics-block').addClass('d-none');
        $('.visual-block').find(`.graphics-block[data-id=${cId}]`).removeClass('d-none');
    });
    

    $('#exerciseCardModal').on('click', '.exs-change', (e) => {
        let dir = $(e.currentTarget).attr('data-dir');
        let elems = $('.exercises-list').find('.exs-elem');
        if (elems.length > 1) {
            let activeInd = -1;
            for (let i = 0; i < elems.length; i++) {
                let elem = elems[i];
                if ($(elem).hasClass('active')) {
                    activeInd = i;
                    break;
                }
            }
            if (activeInd != -1) {
                activeInd = dir == "next" ? (activeInd + 1) : dir == "prev" ? (activeInd - 1) : activeInd;
                activeInd = (activeInd < 0) ? (elems.length - 1) : (activeInd > elems.length - 1) ? 0 : activeInd;
                $(elems).removeClass('active');
                $(elems[activeInd]).addClass('active');
                let exsId = $(elems[activeInd]).attr('data-id');
                let fromNfbFolder = !$('.exercises-list').find('.folders_nfb_list').hasClass('d-none');
                let data = {'get_exs_one': 1, 'exs': exsId, 'get_nfb': fromNfbFolder ? 1 : 0};
                $('.page-loader-wrapper').fadeIn();
                $.ajax({
                    headers:{"X-CSRFToken": csrftoken},
                    data: data,
                    type: 'GET', // GET или POST
                    dataType: 'json',
                    url: "exercises_api",
                    success: function (res) {
                        if (res.success) {
                            RenderExerciseOne(res.data);
                        }
                    },
                    error: function (res) {
                        console.log(res);
                    },
                    complete: function (res) {
                        $('.page-loader-wrapper').fadeOut();
                    }
                });
            }
        }
    });


    // Open exercise's card
    $('#openCardView').on('click', (e) => {
        if ($('.exs-list-group').find('.list-group-item.active').length > 0) {
            $('#exerciseCardModal').find('.exs_edit_field').prop('disabled', true);
            $('#exerciseCardModal').find('.btn-only-edit').prop('disabled', false);
            $('#exerciseCardModal').find('.btn-not-view').toggleClass('d-none', true);
            $('#exerciseCardModal').find('.add-row').toggleClass('d-none', true);
            $('#exerciseCardModal').find('.remove-row').toggleClass('d-none', true);
            document.descriptionEditor.enableReadOnlyMode('');
            $('#exerciseCardModal').modal('show');
        } else {
            swal("Внимание", "Выберите упражнение для просмотра.", "info");
        }
    });
    $('#openCardEdit').on('click', (e) => {
        if ($('.exs-list-group').find('.list-group-item.active').length > 0) {
            $('#exerciseCardModal').find('.exs_edit_field').prop('disabled', false);
            $('#exerciseCardModal').find('.btn-only-edit').prop('disabled', false);
            $('#exerciseCardModal').find('.btn-not-view').toggleClass('d-none', false);
            $('#exerciseCardModal').find('.add-row').toggleClass('d-none', false);
            $('#exerciseCardModal').find('.remove-row').toggleClass('d-none', false);
            $('#exerciseCardModal').find('.add-row').prop('disabled', false);
            $('#exerciseCardModal').find('.remove-row').prop('disabled', true);
            $('#exerciseCardModal').find('.remove-row.btn-on').prop('disabled', false);
            document.descriptionEditor.disableReadOnlyMode('');
            $('#exerciseCardModal').modal('show');
        } else {
            swal("Внимание", "Выберите упражнение для просмотра.", "info");
        }
    });


    $('#createExercise').on('click', (e) => {
        let folderType = $('.folders_div.selected').attr('data-id');
        if ($(e.currentTarget).hasClass('usr-dft') && folderType == "nfb_folders") {
            $(e.currentTarget).removeClass('selected3');
            swal("Внимание", "Выберите папки <Команда> для добавления упражнения.", "info");
            return;
        }
        if (!$('.up-tabs-elem[data-id="trainer_folders"]').hasClass('d-none')) {
            $(e.currentTarget).removeClass('selected3');
            swal("Внимание", "Отключите упражнения тренера.", "info");
            return;
        }
        let cLink = `/exercises/exercise?id=new&type=${folderType}&section=card`;
        // window.location.href = cLink;
        $('#exerciseCardModalForEdit').find('iframe').addClass('d-none');
        $('#exerciseCardModalForEdit').find('iframe').attr('src', cLink);
        $('#exerciseCardModalForEdit').modal('show');
        $('#exerciseCardModalForEdit').find('.btn-change-exs').addClass('d-none');
        $(e.currentTarget).addClass('selected3');
    });


    $('#exerciseCardModal').on('contextmenu', (e) => {
        e.preventDefault();
    });
    $('#exerciseCardModal').on('click', '#openDescription', (e) => {
        $('#exerciseCardModal').find('#openContent').removeClass('btn-success');
        $('#exerciseCardModal').find('#openContent').addClass('btn-secondary');
        $(e.currentTarget).removeClass('btn-secondary');
        $(e.currentTarget).addClass('btn-success');
        $('#exerciseCardModal').find('#cardBlock > .tab-pane').removeClass('show active');
        $('#exerciseCardModal').find('#cardBlock > #card_description').addClass('show active');
    });
    $('#exerciseCardModal').on('click', '#openContent', (e) => {
        $('#exerciseCardModal').find('#openDescription').removeClass('btn-success');
        $('#exerciseCardModal').find('#openDescription').addClass('btn-secondary');
        $(e.currentTarget).removeClass('btn-secondary');
        $(e.currentTarget).addClass('btn-success');
        $('#exerciseCardModal').find('#cardBlock > .tab-pane').removeClass('show active');
        $('#exerciseCardModal').find('#cardBlock > #card_content').addClass('show active');
    });


    // Go to exercise view
    $('#showOneExs').on('click', (e) => {
        let activeExs = $('.exs-list-group').find('.list-group-item.active');
        let activeExsId = $(activeExs).attr('data-id');
        if ($(activeExs).length > 0) {
            let fromNfbFolder = !$('.exercises-list').find('.folders_nfb_list').hasClass('d-none');
            let folderType = $('.folders_div.selected').attr('data-id');
            let folder = $('.folders-block').find('.list-group-item.active > div').attr('data-id');
            let data = {'type': folderType, 'folder': folder, 'exs': activeExsId};
            data = JSON.stringify(data);
            sessionStorage.setItem('last_exs', data);

            let exsList = {'list': [], 'index': -1};
            $('.exercises-list').find('.exs-elem').each((ind, elem) => {
                if ($(elem).attr('data-id') == activeExsId) {
                    exsList['index'] = ind;
                }
                exsList['list'].push($(elem).attr('data-id'));
            });
            exsList = JSON.stringify(exsList);
            sessionStorage.setItem('exs_list', exsList);

            window.location.href = `/exercises/exercise?id=${activeExsId}&nfb=${fromNfbFolder ? 1 : 0}&type=${folderType}`;
        } else {
            swal("Внимание", "Выберите упражнение для просмотра.", "info");
        }
    });


    // Load CkEditor fields
    let cLang = $('#select-language').val();
    try {
        let watchdog_descriptionEditor = new CKSource.EditorWatchdog();
		watchdog_descriptionEditor.setCreator((element, config) => {
			return CKSource.Editor
            .create(element, config)
            .then( editor => {
                document.descriptionEditor = editor;
				return editor;
			})
		});
        watchdog_descriptionEditor.setDestructor(editor => {
            return editor.destroy();
        });
		watchdog_descriptionEditor.on('error', (error) => {
            console.error("Error with CKEditor5: ", error);
        });
        watchdog_descriptionEditor
		.create(document.querySelector('#descriptionEditor'), {
			licenseKey: '',
            language: cLang,
            removePlugins: ['Title'],
		})
		.catch((error) => {
            console.error("Error with CKEditor5: ", error);
        });
    } catch (e) {}
    try {
        let watchdog_descriptionEditorView = new CKSource.EditorWatchdog();
		watchdog_descriptionEditorView.setCreator((element, config) => {
			return CKSource.Editor
            .create(element, config)
            .then( editor => {
                document.descriptionEditorView = editor;
                document.descriptionEditorView.enableReadOnlyMode('');
                $('#descriptionEditorView').next().find('.ck-editor__top').addClass('d-none');
                $('#descriptionEditorView').next().find('.ck-content.ck-editor__editable').addClass('borders-off');
				return editor;
			})
		});
        watchdog_descriptionEditorView.setDestructor(editor => {
            return editor.destroy();
        });
		watchdog_descriptionEditorView.on('error', (error) => {
            console.error("Error with CKEditor5: ", error);
        });
        watchdog_descriptionEditorView
		.create(document.querySelector('#descriptionEditorView'), {
			licenseKey: '',
            language: cLang,
            removePlugins: ['Title'],
		})
		.catch((error) => {
            console.error("Error with CKEditor5: ", error);
        });
    } catch (e) {}

    // ClassicEditor
    //     .create(document.querySelector('#descriptionEditor'), {
    //         language: cLang
    //     })
    //     .then(editor => {
    //         document.descriptionEditor = editor;
    //     })
    //     .catch(err => {
    //         console.error(err);
    //     });
    // ClassicEditor
    //     .create(document.querySelector('#descriptionEditorView'), {
    //         language: cLang
    //     })
    //     .then(editor => {
    //         document.descriptionEditorView = editor;
    //         document.descriptionEditorView.enableReadOnlyMode('');
    //         $('#descriptionEditorView').next().find('.ck-editor__top').addClass('d-none');
    //         $('#descriptionEditorView').next().find('.ck-content.ck-editor__editable').addClass('borders-off');
    //     })
    //     .catch(err => {
    //         console.error(err);
    //     });
 
    
    $('#exerciseCardModal').on('click', '#saveExs', (e) => {
        let exsId = $('#exerciseCardModal').attr('data-exs');
        let dataToSend = {'edit_exs': 1, 'exs': exsId, 'data': {}};
        $('#exerciseCardModal').find('.exs_edit_field').each((ind, elem) => {
            if (!$(elem).hasClass('d-none')) {
                let name = $(elem).attr('name');
                if (name in dataToSend.data) {
                    if (!Array.isArray(dataToSend.data[name])) {
                        let tVal = dataToSend.data[name];
                        dataToSend.data[name] = [tVal];
                    }
                    dataToSend.data[name].push($(elem).val());
                } else {
                    dataToSend.data[name] = $(elem).val();
                }
            }
        });
        dataToSend.data['description'] = document.descriptionEditor.getData();
        if (dataToSend.data.title == "") {
            swal("Внимание", "Добавьте название для упражнения.", "info");
            return;
        }
        if (dataToSend.data.folder_parent == "" || dataToSend.data.folder_main == "") {
            swal("Внимание", "Выберите папку для упражнения.", "info");
            return;
        }
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            headers:{"X-CSRFToken": csrftoken},
            data: dataToSend,
            type: 'POST', // GET или POST
            dataType: 'json',
            url: "exercises_api",
            success: function (res) {
                if (res.success) {
                    swal("Готово", "Упражнение успешно создано / изменено.", "success")
                    .then((value) => {
                        $('.page-loader-wrapper').fadeIn();
                        window.location.reload();
                    });
                } else {
                    swal("Ошибка", `При создании / изменении упражнения произошла ошибка (${res.err}).`, "error");
                }
            },
            error: function (res) {
                swal("Ошибка", "Упражнение не удалось создать / изменить.", "error");
                console.log(res);
            },
            complete: function (res) {
                $('.page-loader-wrapper').fadeOut();
            }
        });
    });
    $('#exerciseCardModal').on('change', '[name="folder_parent"]', (e) => {
        let tId = $(e.currentTarget).val();
        $('#exerciseCardModal').find('[name="folder_main"]').val('');
        $('#exerciseCardModal').find('[name="folder_main"]').find('option').addClass('d-none');
        $('#exerciseCardModal').find('[name="folder_main"]').find(`option[data-parent=${tId}]`).removeClass('d-none');
    });
    $('#exerciseCardModal').on('click', '.row-select-td', (e) => {
        if (!$(e.target).is('td')) {return;}
        let isOn = !$(e.currentTarget).parent().hasClass('active');
        $("#exerciseCardModal").find('tr.row-select').removeClass('active');
        $(e.currentTarget).parent().toggleClass('active', isOn);
    });
    $('#exerciseCardModal').on('click', '.add-row', (e) => {
        let cId = $(e.currentTarget).attr('data-id');
        let cTd = $('#exerciseCardModal').find(`td[data-id="td_${cId}"]`);
        let cloneRow = $(cTd).find('div.row').first().clone();
        $(cloneRow).find('.exs_edit_field').val('');
        $(cloneRow).find('.remove-row').addClass('btn-on');
        $(cloneRow).find('.remove-row').prop('disabled', false);
        $(cTd).append(cloneRow);
    });
    $('#exerciseCardModal').on('click', '.remove-row', (e) => {
        if (!$(e.currentTarget).hasClass('btn-on')) {return;}
        $(e.currentTarget).parent().parent().remove();
    });
    $('#exerciseCardModal').on('mouseup', '.exs_edit_field', (e) => {
        if ($(e.currentTarget).parent().parent().hasClass('row-select')) {
            let cVal = $(e.currentTarget).val();
            // e.which = 3 -> Right mouse buttom
            if (cVal == "" && e.which == 3 && $(e.currentTarget).parent().find('.exs_edit_field').length > 1) {
                $(e.currentTarget).remove();
            }
        }
    });


    // Delete exercise
    $('#exerciseCardModal').on('click', '#deleteExercise', (e) => {
        swal({
            title: "Вы точно хотите удалить упражнение?",
            text: "После удаления данное упражнение невозможно будет восстановить!",
            icon: "warning",
            buttons: ["Отмена", "Подтвердить"],
            dangerMode: true,
        })
        .then((willDelete) => {
            if (willDelete) {
                let cId = $('.exercises-list').find('.exs-elem').attr('data-id');
                let data = {'delete_exs': 1, 'exs': cId};
                $('.page-loader-wrapper').fadeIn();
                $.ajax({
                    headers:{"X-CSRFToken": csrftoken},
                    data: data,
                    type: 'POST', // GET или POST
                    dataType: 'json',
                    url: "exercises_api",
                    success: function (res) {
                        if (res.success) {
                            swal("Готово", "Упражнение успешно удалено.", "success")
                            .then((value) => {
                                $('.page-loader-wrapper').fadeIn();
                                window.location.reload();
                            });
                        }
                    },
                    error: function (res) {
                        swal("Ошибка", "Упражнение удалить не удалось.", "error");
                        console.log(res);
                    },
                    complete: function (res) {
                        $('.page-loader-wrapper').fadeOut();
                        $('#exerciseCopyModal').modal('hide');
                    }
                });
            }
        });
    });


    // Copy Exs
    let foldersLoadedForCopy = false;
    $('#exerciseCopyModal').on('show.bs.modal', (e) => {
        let isNfb = $('#exerciseCopyModal').find('input[name="nfb"]').val() == '1' && 
            $('.folders_div.selected').attr('data-id') == "nfb_folders" && 
            $('#exerciseCopyModal').find('[name="copy_mode"]').val() != '1';
        console.log(isNfb)
        let htmlList = isNfb ? "folders_nfb_list" : "folders_list";
        let htmlElemInList = isNfb ? "folder-nfb-elem" : "folder-elem";
        if (!foldersLoadedForCopy) {
            let tList = $('.exercises-list').find(`.${htmlList}`).clone();
            console.log( tList )
            $(tList).removeClass('d-none');
            $(tList).removeClass('c-hidden');
            $(tList).removeClass(htmlList);
            $(tList).addClass('folders_list_copy');
            $(tList).find(`.${htmlElemInList}`).addClass('folder-copy-elem');
            $(tList).find(`.${htmlElemInList}`).removeClass(htmlElemInList);
            $(tList).find('.pull-right').remove();
            $(tList).find('.list-group-item').removeClass('d-none');
            $(tList).find('.list-group-item > div').each((ind, elem) => {
                let tText = `${$(elem).attr('data-short')}. ${$(elem).attr('data-name')}`;
                $(elem).find('.folder-title').html(tText);
            });
            $('#exerciseCopyModal').find('.modal-body').find('.copy-move-exercise').html(tList);
            // foldersLoadedForCopy = true;
        }
        $('#exerciseCopyModal').find('.btn-scheme-copy-apply').addClass('d-none');
        $('#exerciseCopyModal').find('.btn-video-move-apply').addClass('d-none');
        window.moveVideoFromExsToExs = null;
        window.copySchemeFromExsToExs = null;
    });
    $('#exerciseCopyModal').on('hidden.bs.modal', (e) => {
        $('.up-tabs-elem[data-id="copy"]').removeClass('selected3');
        $('.up-tabs-elem[data-id="copy"]').attr('data-state', '0');
        $('.up-tabs-elem[data-id="move"]').removeClass('selected3');
        $('.up-tabs-elem[data-id="move"]').attr('data-state', '0');
        $('#exerciseCopyModal').find('.folder-copy-elem').parent().removeClass('active');
    });
    $('#exerciseCopyModal').on('click', '.folder-copy-elem', (e) => {
        if ($(e.currentTarget).attr('data-root') != "1") {
            $('#exerciseCopyModal').find('.folder-copy-elem').parent().removeClass('active');
            $(e.currentTarget).parent().addClass('active');
        }
    });
    $('#exerciseCopyModal').on('change', 'select[name="copy_mode"]', (e) => {
        let val = $(e.currentTarget).val();
        $('#exerciseCopyModal').find('.info-text').toggleClass('d-none', val == '1');
    });
    $('#exerciseCopyModal').on('click', '.btn-apply', (e) => {
        if ($('#exerciseCopyModal').find('.list-group-item.active').length > 0) {
            let modeVal = $('#exerciseCopyModal').find('select[name="copy_mode"]').val();
            let exsId = $('.exs-list-group').find('.exs-elem.active').attr('data-id');
            let moveMode = $('#exerciseCopyModal').find('.toggle-mode.active').attr('data-mode');
            if (moveMode == "all") {
                exsId = [];
                $('.exs-list-group').find('.exs-elem:visible').each((ind, elem) => {
                    exsId.push($(elem).attr('data-id'));
                });
            }
            let isTrainer = $('.up-tabs-elem[data-id="trainer_folders"]').length > 0 && !$('.up-tabs-elem[data-id="trainer_folders"]').hasClass('d-none');
            let fromNfbFolder = !$('.exercises-list').find('.folders_nfb_list').hasClass('d-none');
            let selectedFolder = $('#exerciseCopyModal').find('.list-group-item.active').find('.folder-copy-elem').attr('data-id');
            let folderType = $('.folders_div.selected').attr('data-id');
            if (isTrainer) {folderType = "__is_trainer";}
            let data = {
                'move_exs': modeVal == '2' ? 1 : 0,
                'copy_exs': modeVal == '1' ? 1 : 0,
                'move_mode': moveMode,
                'exs': exsId, 
                'nfb_folder': fromNfbFolder ? 1 : 0, 
                'folder': selectedFolder,
                'type': folderType
            };
            $('.page-loader-wrapper').fadeIn();
            $.ajax({
                headers:{"X-CSRFToken": csrftoken},
                data: data,
                type: 'POST', // GET или POST
                dataType: 'json',
                url: "exercises_api",
                success: function (res) {
                    if (res.success) {
                        swal("Готово", "Обновите папку, чтобы увидеть данное упражение.", "success");
                    } else {
                        swal("Ошибка", "Упражнение не удалось скопировать / переместить.", "error");
                        console.log(res);
                    }
                },
                error: function (res) {
                    swal("Ошибка", "Упражнение не удалось скопировать / переместить.", "error");
                    console.log(res);
                },
                complete: function (res) {
                    $('.page-loader-wrapper').fadeOut();
                    $('#exerciseCopyModal').modal('hide');
                }
            });
        }
    });
    $('#exerciseCopyModal').on('click', '.toggle-mode', (e) => {
        let cId = $(e.currentTarget).attr('data-id');
        $('#exerciseCopyModal').find('.select-video').prop('checked', false);
        $('#exerciseCopyModal').find('.select-scheme').prop('checked', false);
        $('#exerciseCopyModal').find('.toggle-mode').removeClass('active');
        $(e.currentTarget).addClass('active');
        $('#exerciseCopyModal').find('.content-block').addClass('d-none');
        $('#exerciseCopyModal').find(`.content-block.${cId}`).removeClass('d-none');
        if (cId == "copy-move-exercise-2") {
            cId = "copy-move-exercise";
            $('#exerciseCopyModal').find(`.content-block.${cId}`).removeClass('d-none');
        }
        $('#exerciseCopyModal').find('.exs-applier').toggleClass('d-none', cId != "copy-move-exercise");
        let cTitle = "";
        if ($('#exerciseCopyModal').find('[name="copy_mode"]').val() == '1') {
            cTitle = "Скопировать упражнение в выбранную папку";
        } else {
            cTitle = "Переместить упражнение в выбранную папку";
        }
        if (cId.includes("scheme")) {
            cTitle = "Скопировать рисунок";
        }
        if (cId.includes("video")) {
            cTitle = "Переместить видео";
        }
        if (cId.includes("animation")) {
            cTitle = "Переместить анимацию";
        }
        $('#exerciseCopyModal').find('.btn-scheme-copy-apply').addClass('d-none');
        $('#exerciseCopyModal').find('.btn-video-move-apply').addClass('d-none');
        if (cId == "copy-scheme-1") {
            $('#exerciseCopyModal').find('.btn-scheme-copy-apply[data-value="scheme_1"]').removeClass('d-none');
        } else if (cId == "copy-scheme-2") {
            $('#exerciseCopyModal').find('.btn-scheme-copy-apply[data-value="scheme_2"]').removeClass('d-none');
        } else if (cId == "move-video-1") {
            $('#exerciseCopyModal').find('.btn-video-move-apply[data-value="video_1"]').removeClass('d-none');
        } else if (cId == "move-animation-1") {
            $('#exerciseCopyModal').find('.btn-video-move-apply[data-value="animation_1"]').removeClass('d-none');
        }
        $('#exerciseCopyModal').find('.modal-title').text(cTitle);
    });
    $('#exerciseCopyModal').on('click', '.btn-video-move-apply', (e) => {
        let exsId = $('.exs-list-group').find('.exs-elem.active').attr('data-id');
        let folderType = $('.folders_div.selected').attr('data-id');
        let selectedVideos = [$(e.currentTarget).attr('data-value')];
        if (selectedVideos.length > 0) {
            window.moveVideoFromExsToExs = {'f_type': folderType, 'exs_from': exsId, 'content': selectedVideos};
            $('.exercises-block').find('.copy-modal-status').find('.description').text("Выберите упражнение, в которое хотите поместить видео/анимацию.");
            $('.exercises-block').find('.copy-modal-status').removeClass('d-none');
            $('.exercises-block').find('.copy-modal-status').addClass('d-flex');
            $('.exercises-list').find('.exs-elem').removeClass('active');
        }
        $('#exerciseCopyModal').modal('hide');
    });
    $('#exerciseCopyModal').on('click', '.btn-scheme-copy-apply', (e) => {
        let exsId = $('.exs-list-group').find('.exs-elem.active').attr('data-id');
        let folderType = $('.folders_div.selected').attr('data-id');
        let selectedSchemes = [$(e.currentTarget).attr('data-value')];
        if (selectedSchemes.length > 0) {
            window.copySchemeFromExsToExs = {'f_type': folderType, 'exs_from': exsId, 'content': selectedSchemes};
            $('.exercises-block').find('.copy-modal-status').find('.description').text("Выберите упражнение, в которое хотите поместить рисунок.");
            $('.exercises-block').find('.copy-modal-status').removeClass('d-none');
            $('.exercises-block').find('.copy-modal-status').addClass('d-flex');
            $('.exercises-list').find('.exs-elem').removeClass('active');
        }
        $('#exerciseCopyModal').modal('hide');
    });
    $('.copy-modal-status').on('click', '.btn-apply', (e) => {
        if (window.moveVideoFromExsToExs) {
            let folderType = $('.folders_div.selected').attr('data-id');
            let exsId = $('.exs-list-group').find('.exs-elem.active').attr('data-id');
            if (window.moveVideoFromExsToExs['f_type'] && window.moveVideoFromExsToExs['f_type'] == "nfb_folders" && folderType == "nfb_folders") {
                swal({
                    title: "Вы точно хотите переместить контент в это упражнение?",
                    text: ``,
                    icon: "warning",
                    buttons: ["Отмена", "Подтвердить"],
                    dangerMode: true,
                })
                .then((willMoving) => {
                    if (willMoving) {
                        MoveVideoFromExsToExs(exsId);
                        window.moveVideoFromExsToExs = null;
                        $('.exercises-block').find('.copy-modal-status').removeClass('d-flex');
                        $('.exercises-block').find('.copy-modal-status').addClass('d-none');
                    }
                });
            } else {
                swal("Внимание", "Оба упражнения должны быть из папок N.F.", "info");
                window.moveVideoFromExsToExs = null;
                $('.exercises-block').find('.copy-modal-status').removeClass('d-flex');
                $('.exercises-block').find('.copy-modal-status').addClass('d-none');
            }
        } else if (window.copySchemeFromExsToExs) {
            let folderType = $('.folders_div.selected').attr('data-id');
            let exsId = $('.exs-list-group').find('.exs-elem.active').attr('data-id');
            swal({
                title: "Вы точно хотите скопировать контент в это упражнение?",
                text: ``,
                icon: "warning",
                buttons: ["Отмена", "Подтвердить"],
                dangerMode: true,
            })
            .then((willCopying) => {
                if (willCopying) {
                    CopySchemeFromExsToExs(exsId, folderType);
                    window.copySchemeFromExsToExs = null;
                    $('.exercises-block').find('.copy-modal-status').removeClass('d-flex');
                    $('.exercises-block').find('.copy-modal-status').addClass('d-none');
                }
            });
        }
    });
    $('.copy-modal-status').on('click', '.btn-cancel', (e) => {
        window.moveVideoFromExsToExs = null;
        window.copySchemeFromExsToExs = null;
        $('.exercises-block').find('.copy-modal-status').removeClass('d-flex');
        $('.exercises-block').find('.copy-modal-status').addClass('d-none');
    });

    let startDate = getFormattedDateFromTodayWithDelta(1);
    let endDate = getFormattedDateFromTodayWithDelta(8);
    $('#exerciseShareModal').find('input[name="date"]').val(startDate);
    $('#exerciseShareModal').find('input[name="date"]').attr('min', startDate);
    $('#exerciseShareModal').find('input[name="date"]').attr('max', endDate);
    $('#exerciseShareModal').on('show.bs.modal', (e) => {
        $('#exerciseShareModal').find('input[type="checkbox"]').prop('checked', true);
        $('#exerciseShareModal').find('.form-check.form-check-inline').removeClass('d-none');

        let isScheme1Hide = $('#splitCol_2').find('#carouselSchema').find('.carousel-item').first().hasClass('d-none');
        let isScheme2Hide = $('#splitCol_2').find('#carouselSchema').find('.carousel-item').last().hasClass('d-none');
        let isVideo1Hide = $('#splitCol_2').find('#carouselVideo').find('.carousel-item').first().hasClass('d-none');
        let isVideo2Hide = $('#splitCol_2').find('#carouselVideo').find('.carousel-item').last().hasClass('d-none');
        let isAnimation1Hide = $('#splitCol_2').find('#carouselAnim').find('.carousel-item').first().hasClass('d-none');
        let isAnimation2Hide = $('#splitCol_2').find('#carouselAnim').find('.carousel-item').last().hasClass('d-none');
        $('#exerciseShareModal').find('input[type="checkbox"][name="scheme_1"]').parent().toggleClass('d-none', isScheme1Hide);
        $('#exerciseShareModal').find('input[type="checkbox"][name="scheme_2"]').parent().toggleClass('d-none', isScheme2Hide);
        $('#exerciseShareModal').find('input[type="checkbox"][name="video_1"]').parent().toggleClass('d-none', isVideo1Hide);
        $('#exerciseShareModal').find('input[type="checkbox"][name="video_2"]').parent().toggleClass('d-none', isVideo2Hide);
        $('#exerciseShareModal').find('input[type="checkbox"][name="animation_1"]').parent().toggleClass('d-none', isAnimation1Hide);
        $('#exerciseShareModal').find('input[type="checkbox"][name="animation_2"]').parent().toggleClass('d-none', isAnimation2Hide);
        
        $('#exerciseShareModal').find('.create-block').removeClass('d-none');
        $('#exerciseShareModal').find('.link-text > a').text('-');
        $('#exerciseShareModal').find('.link-text > a').attr('href', '');
        $('#exerciseShareModal').find('button.btn-share').attr('data-link', "");
        $('#exerciseShareModal').find('.link-qrcode').html('');

        let exsId = $('.exercises-block').find('.exs-elem.active').attr('data-id');
        let folderType = $('.folders-container').find('.folders-toggle.selected').first().attr('data-id');
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            headers:{"X-CSRFToken": csrftoken},
            data: {'get_link': 1, 'id': exsId, 'type': `exercise_${folderType}`},
            type: 'GET', // GET или POST
            dataType: 'json',
            url: "/shared/shared_link_api",
            success: function (res) {
                if (res.success) {
                    $('#exerciseShareModal').find('.create-block').addClass('d-none');
                    $('#exerciseShareModal').find('.link-text > a').text(res.data.link);
                    $('#exerciseShareModal').find('.link-text > a').attr('href', res.data.link);
                    $('#exerciseShareModal').find('button.btn-share').attr('data-link', res.data.link);
                    $('#exerciseShareModal').find('.link-qrcode').ClassyQR({
                        create: true,
                        type: 'url',
                        url: res.data.link
                    });
                }
            },
            error: function (res) {
                console.log(res);
            },
            complete: function (res) {
                $('.page-loader-wrapper').fadeOut();
            }
        });
    });
    $('#exerciseShareModal').on('hidden.bs.modal', (e) => {
        $('.up-tabs-elem[data-id="share"]').removeClass('selected3');
        $('.up-tabs-elem[data-id="share"]').attr('data-state', '0');
    });
    $('#exerciseShareModal').on('click', '.btn-share', (e) => {
        let cLink = $(e.currentTarget).attr('data-link');
        if (cLink && cLink != "") {
            try {
                copyTextToClipboard(cLink);
            } catch(e) {}
            swal("Готово", `Ссылка скопирована (${cLink})!`, "success");
            return;
        }
        let exsId = $('.exercises-block').find('.exs-elem.active').attr('data-id');
        let folderType = $('.folders-container').find('.folders-toggle.selected').first().attr('data-id');
        let expireDate = $('#exerciseShareModal').find('input[name="date"]').val();
        let options = {};
        $('#exerciseShareModal').find('input[type="checkbox"]:visible').each((ind, elem) => {
            options[$(elem).attr('name')] = $(elem).prop('checked') ? 1 : 0;
        });
        let dataToSend = {
            'add_link': 1,
            'id': exsId,
            'type': `exercise_${folderType}`,
            'expire_date': expireDate,
            'options': JSON.stringify(options)
        };
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            headers:{"X-CSRFToken": csrftoken},
            data: dataToSend,
            type: 'POST', // GET или POST
            dataType: 'json',
            url: "/shared/shared_link_api",
            success: function (res) {
                if (res.success) {
                    $('#exerciseShareModal').find('.link-text > a').text(res.data.link);
                    $('#exerciseShareModal').find('.link-text > a').attr('href', res.data.link);
                    $('#exerciseShareModal').find('button.btn-share').attr('data-link', res.data.link);
                    $('#exerciseShareModal').find('.link-qrcode').ClassyQR({
                        create: true,
                        type: 'url',
                        url: res.data.link
                    });
                    try {
                        copyTextToClipboard(res.data.link);
                    } catch(e) {}
                    swal("Готово", `Ссылка скопирована (${res.data.link})!`, "success");
                }
            },
            error: function (res) {
                if (res.responseJSON.type == "date") {
                    swal("Ошибка", "Дата введена не корректно!", "error");
                } else if (res.responseJSON.type == "link") {
                    swal("Ошибка", "Невозможно создать общую ссылку!", "error");
                }
                console.log(res);
            },
            complete: function (res) {
                $('.page-loader-wrapper').fadeOut();
            }
        });
    });

    // Open last exercise from card
    window.lastExercise = null;
    CheckLastExs();


    // Toggle marker for exercise
    $('.exercises-block').on('click', 'button[data-type="marker"]', (e) => {
        let currentTarget = e.currentTarget;
        let exsElem = $(currentTarget).parent().parent().parent();
        let exsId = $(exsElem).attr('data-id');
        let fromNFB = !$('.exercises-list').find('.folders_nfb_list').hasClass('d-none') ? 1 : 0;
        let cId = $(currentTarget).attr('data-id');
        let state = $(currentTarget).hasClass('selected');
        let val = $(currentTarget).attr('data-val');
        let folderType = $('.folders_div.selected').attr('data-id');
        let isTrainer = $('.up-tabs-elem[data-id="trainer_folders"]').length > 0 && !$('.up-tabs-elem[data-id="trainer_folders"]').hasClass('d-none');
        if (isTrainer) {folderType = "__is_trainer";}
        let dataToSend = {'edit_exs_user_params': 1, 'exs': exsId, 'nfb': fromNFB, 'type': folderType, 'data': {'key': cId, 'value': state ? 0 : 1}};
        if (cId == "trainer") {
            ToggleExerciseToArchive(exsElem, exsId, folderType, val);
            return;
        }
        swal({
            title: "Вы точно хотите внести изменения?",
            icon: "warning",
            buttons: ["Отмена", "Подтвердить"],
            dangerMode: false,
        })
        .then((accepted) => {
            if (accepted) {
                $('.page-loader-wrapper').fadeIn();
                $.ajax({
                    headers:{"X-CSRFToken": csrftoken},
                    data: dataToSend,
                    type: 'POST', // GET или POST
                    dataType: 'json',
                    url: "exercises_api",
                    success: function (res) {
                        if (!res.success) {
                            swal("Ошибка", `При изменении параметра произошла ошибка (${res.err}).`, "error");
                        } else {
                            if (cId == "watched") {
                                LoadFolderExercises();
                            }
                            if (cId == "like") {
                                $(currentTarget).parent().find('button[data-type="marker"][data-id="dislike"]').toggleClass('selected', false);
                            }
                            if (cId == "dislike") {
                                $(currentTarget).parent().find('button[data-type="marker"][data-id="like"]').toggleClass('selected', false);
                            }
                            $(currentTarget).toggleClass('selected', res.data.value == 1);
                            if ($(currentTarget).find('input').length > 0) {
                                $(currentTarget).find('input').prop('checked', res.data.value == 1);
                            }
                            if ($(currentTarget).find('span.icon-custom').length > 0) {
                                $(currentTarget).find('span.icon-custom').toggleClass('icon--favorite', res.data.value != 1);
                                $(currentTarget).find('span.icon-custom').toggleClass('icon--favorite-selected', res.data.value == 1);
                            }
                        }
                    },
                    error: function (res) {
                        swal("Ошибка", "При изменении параметра произошла ошибка.", "error");
                        console.log(res);
                    },
                    complete: function (res) {
                        $('.page-loader-wrapper').fadeOut();
                    }
                });
            } else {
                if ($(currentTarget).find('input').length > 0) {
                    $(currentTarget).find('input').prop('checked', state);
                }
            }
        });
    });


    // Toggle admin option
    $('.exercises-block').on('click', 'button[data-type="icons"][data-info="admin_options"]', (e) => {
        let exsId = $(e.currentTarget).parent().parent().parent().attr('data-id');
        let fromNFB = !$('.exercises-list').find('.folders_nfb_list').hasClass('d-none') ? 1 : 0;
        let cId = $(e.currentTarget).attr('data-id');
        let state = $(e.currentTarget).hasClass('selected');
        let folderType = $('.folders_div.selected').attr('data-id');
        let dataToSend = {'edit_exs_admin_options': 1, 'exs': exsId, 'nfb': fromNFB, 'type': folderType, 'data': {'key': cId, 'value': state ? 0 : 1}};
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            headers:{"X-CSRFToken": csrftoken},
            data: dataToSend,
            type: 'POST', // GET или POST
            dataType: 'json',
            url: "exercises_api",
            success: function (res) {
                if (!res.success) {
                    swal("Ошибка", `При изменении параметра произошла ошибка (${res.err}).`, "error");
                } else {
                    $(e.currentTarget).toggleClass('selected', res.data.value == 1);
                    if ($(e.currentTarget).find('input').length > 0) {
                        $(e.currentTarget).find('input').prop('checked', res.data.value == 1);
                    }
                }
            },
            error: function (res) {
                swal("Ошибка", "При изменении параметра произошла ошибка.", "error");
                console.log(res);
            },
            complete: function (res) {
                $('.page-loader-wrapper').fadeOut();
            }
        });
    });


    // Toggle lang modal
    $('.exercises-block').on('click', 'button[data-type="icons"][data-id="lang"]', (e) => {
        let exsId = $(e.currentTarget).parent().parent().parent().attr('data-id');
        $('#exerciseLangTitleModal').find('.modal-dialog[role="document"]').attr('data-exs', exsId);
        $('#exerciseLangTitleModal').modal('show');
        LoadExerciseFullName();
    });
    document.descriptionEditorAdmin = {};
    $('#select-language').find('option').each((ind, elem) => {
        let tId = `#descriptionEditor__admin_${$(elem).val()}`;

        try {
            let watchdog_descriptionEditorAdmin = new CKSource.EditorWatchdog();
            watchdog_descriptionEditorAdmin.setCreator((element, config) => {
                return CKSource.Editor
                .create(element, config)
                .then( editor => {
                    document.descriptionEditorAdmin[$(elem).val()] = editor;
                    $(tId).next().find('.ck-editor__top').removeClass('d-none');
                    $(tId).next().find('.ck-content.ck-editor__editable').removeClass('borders-off');
                    document.descriptionEditorAdmin[$(elem).val()].editing.view.document.on('change:isFocused', (evt, data, isFocused) => {
                        if (isFocused == false) {
                            let exsId = $('#exerciseLangTitleModal').find('.modal-dialog[role="document"]').attr('data-exs');
                            let folderType = $('.folders_div.selected').attr('data-id');
                            let cVal = document.descriptionEditorAdmin[$(elem).val()].getData();
                            let cLangCode = $(elem).val();
                            SaveExerciseFullName(exsId, folderType, 'description', cVal, cLangCode);
                        }
                    });
                    return editor;
                })
            });
            watchdog_descriptionEditorAdmin.setDestructor(editor => {
                return editor.destroy();
            });
            watchdog_descriptionEditorAdmin.on('error', (error) => {
                console.error("Error with CKEditor5: ", error);
            });
            watchdog_descriptionEditorAdmin
            .create(document.querySelector(tId), {
                licenseKey: '',
                language: cLang,
                removePlugins: ['Title'],
            })
            .catch((error) => {
                console.error("Error with CKEditor5: ", error);
            });
        } catch(e) {}

        // ClassicEditor
        // .create(document.querySelector(tId), {
        //     language: cLang
        // })
        // .then(editor => {
        //     document.descriptionEditorAdmin[$(elem).val()] = editor;
        //     $(tId).next().find('.ck-editor__top').removeClass('d-none');
        //     $(tId).next().find('.ck-content.ck-editor__editable').removeClass('borders-off');

        //     document.descriptionEditorAdmin[$(elem).val()].editing.view.document.on('change:isFocused', (evt, data, isFocused) => {
        //         if (isFocused == false) {
        //             let exsId = $('#exerciseLangTitleModal').find('.modal-dialog[role="document"]').attr('data-exs');
        //             let folderType = $('.folders_div:not(.d-none)').attr('data-id');
        //             let cVal = document.descriptionEditorAdmin[$(elem).val()].getData();
        //             let cLangCode = $(elem).val();
        //             SaveExerciseFullName(exsId, folderType, 'description', cVal, cLangCode);
        //         }
        //     });
        // })
        // .catch(err => {
        //     console.error(err);
        // });
    });
    $('#exerciseLangTitleModal').on('change', 'input.exs-title', (e) => {
        let exsId = $('#exerciseLangTitleModal').find('.modal-dialog[role="document"]').attr('data-exs');
        let folderType = $('.folders_div.selected').attr('data-id');
        let cVal = $(e.currentTarget).val();
        let cLangCode = $(e.currentTarget).attr('data-lang');
        SaveExerciseFullName(exsId, folderType, 'title', cVal, cLangCode);
    });
    $('#exerciseLangTitleModal').on('click', '.change-title-pos-prev', (e) => {
        let exsId = $('#exerciseLangTitleModal').find('.modal-dialog[role="document"]').attr('data-exs');
        let folderType = $('.folders_div.selected').attr('data-id');
        let cVal = $(e.currentTarget).parent().parent().find('input.exs-title').val();
        let cLangCode = $(e.currentTarget).parent().parent().find('input.exs-title').attr('data-lang');
        let prevRow = $(e.currentTarget).parent().parent().prevAll().not(".d-none").first();
        if (prevRow.length == 0) {
            prevRow = $('#exerciseLangTitleModal').find('div#collapse__exs_title').find('tr:not(.d-none)').last();
        }
        let prevVal = $(prevRow).find('input.exs-title').val();
        let prevLangCode = $(prevRow).find('input.exs-title').attr('data-lang');
        $(e.currentTarget).parent().parent().find('input.exs-title').val(prevVal);
        $(prevRow).find('input.exs-title').val(cVal);
        SaveExerciseFullName(exsId, folderType, 'title', prevVal, cLangCode, {'lang': prevLangCode, 'value': cVal});
    });
    $('#exerciseLangTitleModal').on('click', '.change-title-pos-next', (e) => {
        let exsId = $('#exerciseLangTitleModal').find('.modal-dialog[role="document"]').attr('data-exs');
        let folderType = $('.folders_div.selected').attr('data-id');
        let cVal = $(e.currentTarget).parent().parent().find('input.exs-title').val();
        let cLangCode = $(e.currentTarget).parent().parent().find('input.exs-title').attr('data-lang');
        let nextRow = $(e.currentTarget).parent().parent().nextAll().not(".d-none").first();
        if (nextRow.length == 0) {
            nextRow = $('#exerciseLangTitleModal').find('div#collapse__exs_title').find('tr:not(.d-none)').first();
        }
        let nextVal = $(nextRow).find('input.exs-title').val();
        let nextLangCode = $(nextRow).find('input.exs-title').attr('data-lang');
        $(e.currentTarget).parent().parent().find('input.exs-title').val(nextVal);
        $(nextRow).find('input.exs-title').val(cVal);
        SaveExerciseFullName(exsId, folderType, 'title', nextVal, cLangCode, {'lang': nextLangCode, 'value': cVal});
    });
    ToggleLangsRowsInModal();
    $('#exerciseLangTitleModal').on('change', 'select.toggle-langs', (e) => {
        ToggleLangsRowsInModal();
    });
    $('#exerciseLangTitleModal').on('click', 'button.toggle-langs-all', (e) => {
        $('#exerciseLangTitleModal').find('select.toggle-langs > option').prop('selected', true);
        $('#exerciseLangTitleModal').find('select.toggle-langs').trigger('change');
    });
    $('#exerciseLangTitleModal').on('click', 'button.toggle-langs-reset', (e) => {
        $('#exerciseLangTitleModal').find('select.toggle-langs > option').prop('selected', false);
        $('#exerciseLangTitleModal').find('select.toggle-langs').trigger('change');
    });


    // Open graphics in modal
    $('.visual-block').on('click', '.carousel-item', (e) => {
        let isTrainer = $('.up-tabs-elem[data-id="trainer_folders"]').length > 0 && !$('.up-tabs-elem[data-id="trainer_folders"]').hasClass('d-none');
        let folderType = $('.folders-container').find('.folders-toggle.selected').first().attr('data-id');
        if (isTrainer) {folderType = "__is_trainer";}
        let id = -1;
        try {
            id = parseInt($('.exercises-block').find('.exs-elem.active').attr('data-id'));
        } catch (e) {}
        let activeNum = 1; let tempCounter = 1;
        let tParentId = $(e.currentTarget).parent().parent().attr('id');
        if (tParentId == "carouselSchema") {
            activeNum = $('#splitCol_2').find('#carouselSchema').find('.carousel-item').index($(e.currentTarget)) + tempCounter;
        } else if (tParentId == "carouselVideo") {
            tempCounter += $('#splitCol_2').find('#carouselSchema').find('.carousel-item:not(.d-none)').length;
            activeNum = $('#splitCol_2').find('#carouselVideo').find('.carousel-item').index($(e.currentTarget)) + tempCounter;
        } else if (tParentId == "carouselAnim") {
            tempCounter += $('#splitCol_2').find('#carouselSchema').find('.carousel-item:not(.d-none)').length;
            tempCounter += $('#splitCol_2').find('#carouselVideo').find('.carousel-item:not(.d-none)').length;
            activeNum = $('#splitCol_2').find('#carouselAnim').find('.carousel-item').index($(e.currentTarget)) + tempCounter;
        }
        LoadGraphicsModal(id, folderType, activeNum);
        return;

        e.preventDefault();

        $('#exerciseGraphicsModal').find('.modal-body').find('.carousel-item').each((ind, elem) => {
            $(elem).removeClass('active');
            if ($(elem).hasClass('description-item')) {return;}
            $(elem).remove();
        });
        let parentId = $(e.currentTarget).parent().parent().attr('id');
        let items = $('#carouselSchema').find('.carousel-item:not(.d-none)').clone();
        if (parentId != "carouselSchema") {$(items).removeClass('active');}
        $('#exerciseGraphicsModal').find('#carouselGraphics > .carousel-inner').append(items);
        
        items = $('#carouselVideo').find('.carousel-item:not(.d-none)').clone();
        if (parentId != "carouselVideo") {$(items).removeClass('active');}
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            if ($(item).find('.video-js').length > 0) {
                $(item).find('.video-js').remove();
                $(item).append(
                    `
                        <video id="video-playerClone-${i}" class="video-js resize-block">
                        </video>
                    `
                );
            }
        }
        $('#exerciseGraphicsModal').find('#carouselGraphics > .carousel-inner').append(items);
        window.videoPlayerClones = [];
        for (let i = 0; i < items.length; i++) {
            window.videoPlayerClones[i] = videojs($('#exerciseGraphicsModal').find(`#video-playerClone-${i}`)[0], {
                preload: 'auto',
                autoplay: false,
                controls: true,
                aspectRatio: '16:9',
                youtube: { "iv_load_policy": 1, 'modestbranding': 1, 'rel': 0, 'showinfo': 0, 'controls': 0 },
            });
            window.videoPlayerClones[i].ready((e) => {
                if (i == 0) {
                    window.videoPlayerClones[i].src({
                        type: window.videoPlayerCard1.currentType(),
                        src: window.videoPlayerCard1.currentSrc()
                    });
                    window.videoPlayerClones[i].poster(window.videoPlayerCard1.poster());
                } else if (i == 1) {
                    window.videoPlayerClones[i].src({
                        type: window.videoPlayerCard2.currentType(),
                        src: window.videoPlayerCard2.currentSrc()
                    });
                    window.videoPlayerClones[i].poster(window.videoPlayerCard2.poster());
                }
            });
        }

        items = $('#carouselAnim').find('.carousel-item:not(.d-none)').clone();
        if (parentId != "carouselAnim") {$(items).removeClass('active');}
        let videoPlayersLength = window.videoPlayerClones.length;
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            if ($(item).find('.video-js').length > 0) {
                $(item).find('.video-js').remove();
                $(item).append(
                    `
                        <video id="video-playerClone-${i + videoPlayersLength}" class="video-js resize-block">
                        </video>
                    `
                );
            }
        }
        $('#exerciseGraphicsModal').find('#carouselGraphics > .carousel-inner').append(items);
        for (let i = 0; i < items.length; i++) {
            window.videoPlayerClones[i + videoPlayersLength] = videojs($('#exerciseGraphicsModal').find(`#video-playerClone-${i + videoPlayersLength}`)[0], {
                preload: 'auto',
                autoplay: false,
                controls: true,
                aspectRatio: '16:9',
                youtube: { "iv_load_policy": 1, 'modestbranding': 1, 'rel': 0, 'showinfo': 0, 'controls': 0 },
            });
            window.videoPlayerClones[i + videoPlayersLength].ready((e) => {
                if (i == 0) {
                    window.videoPlayerClones[i + videoPlayersLength].src({
                        type: window.videoPlayerCard3.currentType(),
                        src: window.videoPlayerCard3.currentSrc()
                    });
                    window.videoPlayerClones[i].poster(window.videoPlayerCard3.poster());
                } else if (i == 1) {
                    window.videoPlayerClones[i + videoPlayersLength].src({
                        type: window.videoPlayerCard4.currentType(),
                        src: window.videoPlayerCard4.currentSrc()
                    });
                    window.videoPlayerClones[i].poster(window.videoPlayerCard4.poster());
                }
            });
        }
        $('#exerciseGraphicsModal').modal('show');
    });
    $('#exerciseGraphicsModal').on('hide.bs.modal', (e) => {
        StopAllVideos();
    });
    $('#exerciseGraphicsModal').on('click', '.carousel-control-prev', (e) => {
        StopAllVideos();
    });
    $('#exerciseGraphicsModal').on('click', '.carousel-control-next', (e) => {
        StopAllVideos();
    });
    $('#exerciseGraphicsModal').on('click', '.video-watched', (e) => {
        let activeExs = $('.exercises-list').find('.exs-elem.active');
        if ($(activeExs).length <= 0) {return;}
        let cId = $(e.currentTarget).attr('data-id');
        $(activeExs).find(`button.btn-marker[data-type="marker"][data-id="${cId}"]`).first().click();
    });

    // Save & Load current folders mode
    window.addEventListener("beforeunload", (e) => {
        let toggledFolders = $('#toggleFoldersNames').attr('data-state') == '1' || true;
        let cFolderType = $('.up-tabs-elem.folders-toggle:not(.d-none)').first().attr('data-id');
        let foldersSettings = JSON.stringify({'expandToggled': toggledFolders, 'type': cFolderType});
        localStorage.setItem('folders_sets', foldersSettings);
    }, false);
    let cFoldersSettings = localStorage.getItem('folders_sets');
    try {
        cFoldersSettings = JSON.parse(cFoldersSettings);
    } catch(e) {}
    if (cFoldersSettings && cFoldersSettings !== null) {
        if (cFoldersSettings.expandToggled !== null && cFoldersSettings.expandToggled !== undefined) {
            if (cFoldersSettings.expandToggled) {
                setTimeout((e) => {
                    $('#toggleFoldersNames').first().click();
                }, 600);
            }
        }
        if (cFoldersSettings.type !== null && cFoldersSettings.type !== undefined) {
            $('.up-tabs-elem.folders-toggle').addClass('d-none');
            $('.up-tabs-elem.folders-toggle').removeClass('selected');

            // temp -> club folders are invisible
            if (cFoldersSettings.type == "club_folders") {
                cFoldersSettings.type == "nfb_folders";
            }

            $(`.up-tabs-elem[data-id="${cFoldersSettings.type}"]`).removeClass('d-none');
            $(`.up-tabs-elem[data-id="${cFoldersSettings.type}"]`).addClass('selected');
            $('.folders-block > div.folders-container > div.folders_div').addClass('d-none');
            $('.folders-block > div.folders-container > div.folders_div').removeClass('selected');
            $(`.folders-block > div.folders-container > div.folders_div[data-id="${cFoldersSettings.type}"]`).removeClass('d-none');
            $(`.folders-block > div.folders-container > div.folders_div[data-id="${cFoldersSettings.type}"]`).addClass('selected');
            if (cFoldersSettings.type == "team_folders") {
                $('.toggle-filter-content').removeClass('btn-custom-outline-green');
                $('.toggle-filter-content').removeClass('btn-custom-outline-red');
                $('.toggle-filter-content').addClass('btn-custom-outline-blue');
                $('.up-tabs-elem').removeClass('b-c-green2');
                $('.up-tabs-elem').removeClass('b-c-red2');
                $('.up-tabs-elem').addClass('b-c-blue2');

                $('.in-card-elem').removeClass('b-c-green2');
                $('.in-card-elem').removeClass('b-c-red2');
                $('.in-card-elem').addClass('b-c-blue2');
            } else if (cFoldersSettings.type == "nfb_folders") {
                $('.toggle-filter-content').removeClass('btn-custom-outline-blue');
                $('.toggle-filter-content').removeClass('btn-custom-outline-red');
                $('.toggle-filter-content').addClass('btn-custom-outline-green');
                $('.up-tabs-elem').removeClass('b-c-blue2');
                $('.up-tabs-elem').removeClass('b-c-red2');
                $('.up-tabs-elem').addClass('b-c-green2');

                $('.in-card-elem').removeClass('b-c-blue2');
                $('.in-card-elem').removeClass('b-c-red2');
                $('.in-card-elem').addClass('b-c-green2');
            } else if (cFoldersSettings.type == "club_folders") {
                $('.toggle-filter-content').removeClass('btn-custom-outline-blue');
                $('.toggle-filter-content').removeClass('btn-custom-outline-green');
                $('.toggle-filter-content').addClass('btn-custom-outline-red');
                $('.up-tabs-elem').removeClass('b-c-blue2');
                $('.up-tabs-elem').removeClass('b-c-green2');
                $('.up-tabs-elem').addClass('b-c-red2');

                $('.in-card-elem').removeClass('b-c-blue2');
                $('.in-card-elem').removeClass('b-c-green2');
                $('.in-card-elem').addClass('b-c-red2');
            }
            ToggleTagsView();
        }
    }
    
    // Download exercise
    $('#downloadExs').on('click', (e) => {
        let activeExs = $('.exs-list-group').find('.list-group-item.active');
        if ($(activeExs).length > 0) {
            $('#exerciseDownloadModal').modal('show');
        } else {
            swal("Внимание", "Выберите упражнение для скачивания.", "info");
        }
    });
    $('#exerciseDownloadModal').on('show.bs.modal', (e) => {
        $('#exerciseDownloadModal').find('input[type="checkbox"]').prop('checked', true);
        $('#exerciseDownloadModal').find('.form-check.form-check-inline').removeClass('d-none');
        let isScheme1Hide = $('#splitCol_2').find('#carouselSchema').find('.carousel-item').first().hasClass('d-none');
        let isScheme2Hide = $('#splitCol_2').find('#carouselSchema').find('.carousel-item').last().hasClass('d-none');
        let isVideo1Hide = $('#splitCol_2').find('#carouselVideo').find('.carousel-item').first().hasClass('d-none');
        let isVideo2Hide = $('#splitCol_2').find('#carouselVideo').find('.carousel-item').last().hasClass('d-none');
        let isAnimation1Hide = $('#splitCol_2').find('#carouselAnim').find('.carousel-item').first().hasClass('d-none');
        let isAnimation2Hide = $('#splitCol_2').find('#carouselAnim').find('.carousel-item').last().hasClass('d-none');
        $('#exerciseDownloadModal').find('input[type="checkbox"][name="scheme_1"]').parent().toggleClass('d-none', isScheme1Hide);
        $('#exerciseDownloadModal').find('input[type="checkbox"][name="scheme_2"]').parent().toggleClass('d-none', isScheme2Hide);
        $('#exerciseDownloadModal').find('input[type="checkbox"][name="video_1"]').parent().toggleClass('d-none', isVideo1Hide);
        $('#exerciseDownloadModal').find('input[type="checkbox"][name="video_2"]').parent().toggleClass('d-none', isVideo2Hide);
        $('#exerciseDownloadModal').find('input[type="checkbox"][name="animation_1"]').parent().toggleClass('d-none', isAnimation1Hide);
        $('#exerciseDownloadModal').find('input[type="checkbox"][name="animation_2"]').parent().toggleClass('d-none', isAnimation2Hide);
    });
    $('#exerciseDownloadModal').on('click', 'button.btn-download', (e) => {
        let activeExs = $('.exs-list-group').find('.list-group-item.active');
        let activeExsId = $(activeExs).attr('data-id');
        let folderType = $('.folders_div.selected').attr('data-id');
        let folder = $('.folders-block').find('.list-group-item.active > div').attr('data-id');
        let schemeRender_1 = $('#exerciseDownloadModal').find('input[name="scheme_1"]:visible').prop('checked') ? 1 : 0;
        let schemeRender_2 = $('#exerciseDownloadModal').find('input[name="scheme_2"]:visible').prop('checked') ? 1 : 0;
        let videoRender_1 = $('#exerciseDownloadModal').find('input[name="video_1"]:visible').prop('checked') ? 1 : 0;
        let videoRender_2 = $('#exerciseDownloadModal').find('input[name="video_2"]:visible').prop('checked') ? 1 : 0;
        let animationRender_1 = $('#exerciseDownloadModal').find('input[name="animation_1"]:visible').prop('checked') ? 1 : 0;
        let animationRender_2 = $('#exerciseDownloadModal').find('input[name="animation_2"]:visible').prop('checked') ? 1 : 0;
        let descriptionRender = $('#exerciseDownloadModal').find('input[name="description"]:visible').prop('checked') ? 1 : 0;
        let descriptionSecondRender = $('#exerciseDownloadModal').find('input[name="description_second_list"]:visible').prop('checked') ? 1 : 0;
        let renderOptions = {
            'scheme_1': schemeRender_1, 'scheme_2': schemeRender_2, 'video_1': videoRender_1, 'video_2': videoRender_2,
            'animation_1': animationRender_1, 'animation_2': animationRender_2, 'description': descriptionRender,
            'description_second': descriptionSecondRender
        };
        renderOptions = JSON.stringify(renderOptions);
        window.open(
            `/exercises/exercise_download?id=${activeExsId}&type=${folderType}&render=${renderOptions}`,
            '_blank'
        ).focus();
    });

    // Open editable panel for exercise
    if (sessionStorage.getItem("exercises__exs_edit_panel") !== null) {
        $('.exs-edit-block').toggleClass('d-none', sessionStorage.getItem("exercises__exs_edit_panel") != '1');
        $('#toggleExsEditPanel').toggleClass('selected3', sessionStorage.getItem("exercises__exs_edit_panel") == '1');
        let folderType = $('.folders_div.selected').attr('data-id');
        $('.exs-edit-block').find('.d-e-nf').toggleClass('d-none', folderType == "nfb_folders");
        $('.folders-block').find('button.edit-exercise.d-e-nf').toggleClass('d-none', folderType == "nfb_folders");
        ToggleMarkersInExs();
    }
    $('#toggleExsEditPanel').on('click', (e) => {
        $('.exs-edit-block').toggleClass('d-none');
        $(e.currentTarget).toggleClass('selected3', !$('.exs-edit-block').hasClass('d-none'));
        let folderType = $('.folders_div.selected').attr('data-id');
        $('.exs-edit-block').find('.d-e-nf').toggleClass('d-none', folderType == "nfb_folders");
        sessionStorage.setItem("exercises__exs_edit_panel", $('.exs-edit-block').hasClass('d-none') ? 0 : 1);
        ToggleMarkersInExs();
    });
    $('.exs-edit-block').on('click', 'button[data-dismiss="panel"]', (e) => {
        $('.exs-edit-block').addClass('d-none');
        $('#toggleExsEditPanel').toggleClass('selected3', !$('.exs-edit-block').hasClass('d-none'));
        sessionStorage.setItem("exercises__exs_edit_panel", 0);
    });
    $('.exs-edit-block').on('click', '.btn-o-modal', (e) => {
        let cId = $(e.currentTarget).attr('data-id');
        let activeExs = $('.exs-list-group').find('.list-group-item.active');
        let activeExsId = $(activeExs).attr('data-id');
        if ($(activeExs).length > 0) {
            if (cId == "description") {
                $('#toggleCardInFolders').attr('data-state', '0');
                $('#toggleCardInFolders').removeClass("c-active");
                $('#toggleCardInFolders').removeClass("selected3");
                $('.exs-edit-block').find('.btn-o-modal[data-id="card"]').removeClass('active');
                if ($('.folders-block').find('.description-container').hasClass('d-none')) {
                    $('.folders-block').find('.folders-container').addClass('d-none');
                    $('.folders-block').find('.description-container').removeClass('d-none');
                    $('.folders-block').find('.card-container').addClass('d-none');
                    $(e.currentTarget).addClass('active');
                    $('#toggleDescriptionInFolders').attr('data-state', '1');
                    $('#toggleDescriptionInFolders').addClass("c-active");
                    $('#toggleDescriptionInFolders').addClass("selected3");
                    try {
                        window.split_sizes_tempo = window.split.getSizes();
                        window.split.setSizes([40, 40]);
                    } catch(e) {}
                } else {
                    $('.folders-block').find('.folders-container').removeClass('d-none');
                    $('.folders-block').find('.description-container').addClass('d-none');
                    $('.folders-block').find('.card-container').addClass('d-none');
                    $(e.currentTarget).removeClass('active');
                    $('#toggleDescriptionInFolders').attr('data-state', '0');
                    $('#toggleDescriptionInFolders').removeClass("c-active");
                    $('#toggleDescriptionInFolders').removeClass("selected3");
                    try {
                        if (window.split_sizes_tempo.length == 2) {
                            window.split.setSizes(window.split_sizes_tempo);
                        }
                    } catch(e) {}
                }
            } else if (cId == "card") {
                $('#toggleDescriptionInFolders').attr('data-state', '0');
                $('#toggleDescriptionInFolders').removeClass("c-active");
                $('#toggleDescriptionInFolders').removeClass("selected3");
                $('.exs-edit-block').find('.btn-o-modal[data-id="description"]').removeClass('active');
                if ($('.folders-block').find('.card-container').hasClass('d-none')) {
                    $('.folders-block').find('.folders-container').addClass('d-none');
                    $('.folders-block').find('.description-container').addClass('d-none');
                    $('.folders-block').find('.card-container').removeClass('d-none');
                    $(e.currentTarget).addClass('active');
                    $('#toggleCardInFolders').attr('data-state', '1');
                    $('#toggleCardInFolders').addClass("c-active");
                    $('#toggleCardInFolders').addClass("selected3");
                    try {
                        window.split_sizes_tempo = window.split.getSizes();
                        window.split.setSizes([40, 40]);
                    } catch(e) {}
                } else {
                    $('.folders-block').find('.folders-container').removeClass('d-none');
                    $('.folders-block').find('.description-container').addClass('d-none');
                    $('.folders-block').find('.card-container').addClass('d-none');
                    $(e.currentTarget).removeClass('active');
                    $('#toggleCardInFolders').attr('data-state', '0');
                    $('#toggleCardInFolders').removeClass("c-active");
                    $('#toggleCardInFolders').removeClass("selected3");
                    try {
                        if (window.split_sizes_tempo.length == 2) {
                            window.split.setSizes(window.split_sizes_tempo);
                        }
                    } catch(e) {}
                }
            } else {
                let fromNfbFolder = !$('.exercises-list').find('.folders_nfb_list').hasClass('d-none');
                let folderType = $('.folders_div.selected').attr('data-id');
                let folder = $('.folders-block').find('.list-group-item.active > div').attr('data-id');
                let linkForModal = `/exercises/exercise?id=${activeExsId}&nfb=${fromNfbFolder ? 1 : 0}&type=${folderType}&section=${cId}`;
                $('#exerciseCardModalForEdit').find('iframe').addClass('d-none');
                $('#exerciseCardModalForEdit').find('iframe').attr('src', linkForModal);
                $('#exerciseCardModalForEdit').modal('show');
                $('#exerciseCardModalForEdit').find('.btn-change-exs').removeClass('d-none');
                $(e.currentTarget).addClass('active');
            }
        } else {
            swal("Внимание", "Выберите упражнение из списка.", "info");
        }
    });
    $('#exerciseCardModalForEdit').on('show.bs.modal', (e) => {
        window.addEventListener('message', (e) => {
            switch(e.data) {
                case "exercise_loaded":
                    $('#exerciseCardModalForEdit').find('iframe').removeClass('d-none');
                    break;
            }
            return;
        });
        $('#sidebar').addClass('z-index-reduce');
    });
    $('#exerciseCardModalForEdit').on('hidden.bs.modal', (e) => {
        $('.exs-edit-block').find('.btn-o-modal').removeClass('active');
        $('#sidebar').removeClass('z-index-reduce');
        $('#createExercise').removeClass('selected3');
    });
    $('#exerciseCardModalForEdit').on('click', '.btn-prev, .btn-next', (e) => {
        let currentList = '.exs-list-group';
        let activeElem = $(currentList).find('.list-group-item.exs-elem.active');
        let loadExs = false;
        if ($(e.currentTarget).hasClass('btn-prev')) {
            if (activeElem.length > 0) {
                $(activeElem).removeClass('active');
                if ($(activeElem).prev().length > 0) {
                    $(activeElem).prev().addClass('active');
                } else {
                    $(currentList).find('.list-group-item.exs-elem').last().addClass('active');
                }
            } else {
                $(currentList).find('.list-group-item.exs-elem').last().addClass('active');
            }
            loadExs = true;
        }
        if ($(e.currentTarget).hasClass('btn-next')) {
            if (activeElem.length > 0) {
                $(activeElem).removeClass('active');
                if ($(activeElem).next().length > 0) {
                    $(activeElem).next().addClass('active');
                } else {
                    $(currentList).find('.list-group-item.exs-elem').first().addClass('active');
                }
            } else {
                $(currentList).find('.list-group-item.exs-elem').first().addClass('active');
            }
            loadExs = true;
        }
        if (loadExs && $(currentList).find('.list-group-item.exs-elem.active').length > 0) {
            $('#exerciseCardModalForEdit').find('iframe').addClass('d-none');
            $('#exerciseCardModalForEdit').find('.btn-change-exs').prop('disabled', true);
            LoadExerciseOneHandler();
            window.addEventListener('message', (e) => {
                switch(e.data) {
                    case "exercise_loaded":
                        let sectionId = $('.exs-edit-block').find('.btn-o-modal.active').attr('data-id');
                        let activeExsId = $('.exs-list-group').find('.list-group-item.active').attr('data-id');
                        let fromNfbFolder = !$('.exercises-list').find('.folders_nfb_list').hasClass('d-none');
                        let folderType = $('.folders_div.selected').attr('data-id');
                        let linkForModal = `/exercises/exercise?id=${activeExsId}&nfb=${fromNfbFolder ? 1 : 0}&type=${folderType}&section=${sectionId}`;
                        $('#exerciseCardModalForEdit').find('iframe').addClass('d-none');
                        $('#exerciseCardModalForEdit').find('iframe').attr('src', linkForModal);
                        window.addEventListener('message', (e) => {
                            switch(e.data) {
                                case "exercise_loaded":
                                    $('#exerciseCardModalForEdit').find('iframe').removeClass('d-none');
                                    $('#exerciseCardModalForEdit').find('.btn-change-exs').prop('disabled', false);
                                    break;
                            }
                            return;
                        }, {once: true});
                        break;
                }
                return;
            }, {once: true});
        }
    });
    $('#exerciseCardModalForEdit').on('click', '.btn-save', (e) => {
        $('.page-loader-wrapper').fadeIn();
        let cFrame = $('#exerciseCardModalForEdit').find('iframe');
        cFrame.contents().find('#saveExs').trigger('click');
        window.addEventListener('message', (e) => {
            switch(e.data) {
                case "exercise_end_edited":
                    $('.page-loader-wrapper').fadeOut();
                    break;
                case "exercise_created":
                    $('#exerciseCardModalForEdit').modal('hide');
                    break;
                case "exercise_edited":
                    $('#exerciseCardModalForEdit').find('iframe').addClass('d-none');
                    break;
            }
            return;
        });
    });

    // CountTrainerExercises();
    $('.exs-edit-block').on('click', '.btn-edit-e', (e) => {
        let cId = $(e.currentTarget).attr('data-id');
        let activeExs = $('.exs-list-group').find('.list-group-item.active');
        if ($(activeExs).length > 0) {
            if (cId == "copy") {
                $('#exerciseCopyModal').find('.modal-title').text("Скопировать упражнение в выбранную папку");
                $('#exerciseCopyModal').find('[name="copy_mode"]').val('1');
                $('#exerciseCopyModal').find('.move-show').addClass('d-none');
                $('#exerciseCopyModal').find('.copy-show').removeClass('d-none');
                $('#exerciseCopyModal').find('.toggle-mode').removeClass('active');
                $('#exerciseCopyModal').find('.toggle-mode[data-id="copy-move-exercise"]').addClass('active');
                $('#exerciseCopyModal').find('.content-block').addClass('d-none');
                $('#exerciseCopyModal').find('.content-block.copy-move-exercise').removeClass('d-none');
                $('#exerciseCopyModal').find('.exs-applier').removeClass('d-none')
                let visibledExsCount = $('.exs-list-group').find('.list-group-item:visible').length;
                $('#exerciseCopyModal').find('.toggle-mode[data-id="copy-move-exercise-2"]').find('.counter').text(` (${visibledExsCount}) `);;
                $('#exerciseCopyModal').modal('show'); 
            } else if (cId == "move") {
                $('#exerciseCopyModal').find('.modal-title').text("Переместить упражнение в выбранную папку");
                $('#exerciseCopyModal').find('[name="copy_mode"]').val('2');
                $('#exerciseCopyModal').find('.copy-show').addClass('d-none');
                $('#exerciseCopyModal').find('.move-show').removeClass('d-none');
                $('#exerciseCopyModal').find('.toggle-mode').removeClass('active');
                $('#exerciseCopyModal').find('.toggle-mode[data-id="copy-move-exercise"]').addClass('active');
                $('#exerciseCopyModal').find('.content-block').addClass('d-none');
                $('#exerciseCopyModal').find('.content-block.copy-move-exercise').removeClass('d-none');
                $('#exerciseCopyModal').find('.exs-applier').removeClass('d-none');
                let visibledExsCount = $('.exs-list-group').find('.list-group-item:visible').length;
                $('#exerciseCopyModal').find('.toggle-mode[data-id="copy-move-exercise-2"]').find('.counter').text(` (${visibledExsCount}) `);
                $('#exerciseCopyModal').modal('show');
            } else if (cId == "trainer") {
                let folderType = $('.folders_div.selected').attr('data-id');
                let moveMode = "";
                if (folderType != "team_folders") {
                    swal("Внимание", "Упражнение должно быть из папки 'Команды'.", "info");
                    return;
                }
                let exsId = null;
                if (Array.isArray(window.selectedExercisesForDelete) && window.selectedExercisesForDelete.length > 0) {
                    exsId = window.selectedExercisesForDelete;
                    moveMode = "all";
                } else {
                    exsId = $(activeExs).attr('data-id');
                }
                let data = {
                    'copy_exs': 1,
                    'move_mode': moveMode,
                    'exs': exsId, 
                    'nfb_folder': 0, 
                    'folder': "__is_trainer",
                    'type': folderType
                };
                $('.page-loader-wrapper').fadeIn();
                $.ajax({
                    headers:{"X-CSRFToken": csrftoken},
                    data: data,
                    type: 'POST', // GET или POST
                    dataType: 'json',
                    url: "exercises_api",
                    success: function (res) {
                        if (res.success) {
                            swal("Готово", "Упражнение добавлено в Архив.", "success");
                        } else {
                            swal("Ошибка", "Упражнение не удалось добавить в Архив.", "error");
                            console.log(res);
                        }
                    },
                    error: function (res) {
                        if (res.responseJSON && res.responseJSON.code && res.responseJSON.code == "limit") {
                            swal("Ошибка", `Упражнение не удалось добавить в Архив. Превышен лимит упражений в папке (максимум: ${res.responseJSON.value}).`, "error");
                        } else {
                            swal("Ошибка", "Упражнение не удалось добавить в Архив.", "error");
                        }
                        console.log(res);
                    },
                    complete: function (res) {
                        window.selectedExercisesForDelete = [];
                        CountTrainerExercises();
                        RenderSelectedExercisesForDelete();
                        $('.page-loader-wrapper').fadeOut();
                        $('.exs-edit-block').find('.btn-edit-e').removeClass('active');
                    }
                });
            } else if (cId == "delete") {
                let isMultiExs = false;
                try {
                    isMultiExs = window.selectedExercisesForDelete.length > 0;
                } catch(e) {}
                let exsId = null;
                if (isMultiExs) {
                    exsId = window.selectedExercisesForDelete;
                } else {
                    exsId = $(activeExs).attr('data-id');
                }
                let folderType = $('.folders_div.selected').attr('data-id');
                let isTrainer = $('.up-tabs-elem[data-id="trainer_folders"]').length > 0 && !$('.up-tabs-elem[data-id="trainer_folders"]').hasClass('d-none');
                if (isTrainer) {folderType = "__is_trainer";}
                let folder = $('.folders-block').find('.list-group-item.active > div').attr('data-id');
                let data = {'type': folderType, 'folder': folder, 'exs': exsId};
                data = JSON.stringify(data);
                sessionStorage.setItem('last_exs', data);
                DeleteExerciseOne(exsId, folderType, isMultiExs);
            } else if (cId == "delete_select") {
                let exsId = $(activeExs).attr('data-id');
                if (!Array.isArray(window.selectedExercisesForDelete)) {
                    window.selectedExercisesForDelete = [];
                }
                if (window.selectedExercisesForDelete.includes(exsId)) {
                    let index = window.selectedExercisesForDelete.indexOf(exsId);
                    if (index !== -1) {
                        window.selectedExercisesForDelete.splice(index, 1);
                    }
                } else {
                    window.selectedExercisesForDelete.push(exsId);
                }
                RenderSelectedExercisesForDelete();
            } else if (cId == "delete_select_full") {
                if (!Array.isArray(window.selectedExercisesForDelete)) {
                    window.selectedExercisesForDelete = [];
                }
                $('.exs-list-group').find('.list-group-item').each((ind, elem) => {
                    let exsId = $(elem).attr('data-id');
                    if (window.selectedExercisesForDelete.includes(exsId)) {
                        let index = window.selectedExercisesForDelete.indexOf(exsId);
                        if (index !== -1) {
                            window.selectedExercisesForDelete.splice(index, 1);
                        }
                    } else {
                        window.selectedExercisesForDelete.push(exsId);
                    }
                });
                RenderSelectedExercisesForDelete();
            }
            $(e.currentTarget).addClass('active');
            if (cId == "delete" || cId == "delete_select") {
                $(e.currentTarget).removeClass('active');
            }
        } else {
            swal("Внимание", "Выберите упражнение из списка.", "info");
        }
    });
    $('#exerciseCopyModal').on('hidden.bs.modal', (e) => {
        $('.exs-edit-block').find('.btn-edit-e').removeClass('active');
    });

    $('.folders-block').on('click', '.edit-exercise', (e) => {
        let cId = $(e.currentTarget).attr('data-id');
        let isSelected = $(e.currentTarget).hasClass('selected');
        if ($('.exs-list-group').find('.list-group-item.exs-elem.active').length == 0) {
            swal("Внимание", "Выберите упражнение из списка.", "info");
            return;
        }
        if ($('.folders-toggle-container').hasClass('df-usr') && $('.folders-toggle[data-id="nfb_folders"]').hasClass('selected')) {
            swal("Внимание", "Редактирование N.F. упражнения невозможно.", "info");
            return;
        }
        if (cId == "description") {
            if (!isSelected) {
                if ($('.exs-list-group').find('.list-group-item.exs-elem.active').hasClass('nf-cloned')) {
                    swal("Внимание", `Только описание "Тренер" сохранится в скопированном N.F. упражнении.`, "info");
                }
                try {
                    document.descriptionEditorViewFromFolders.disableReadOnlyMode('');
                    $('#descriptionEditorViewFromFolders').next().find('.ck-editor__top').removeClass('d-none');
                    $('#descriptionEditorViewFromFolders').next().find('.ck-content.ck-editor__editable').removeClass('borders-off');
                    document.descriptionEditorViewFromFoldersTrainer.disableReadOnlyMode('');
                    $('#descriptionEditorViewFromFoldersTrainer').next().find('.ck-editor__top').removeClass('d-none');
                    $('#descriptionEditorViewFromFoldersTrainer').next().find('.ck-content.ck-editor__editable').removeClass('borders-off');
                } catch(e) {}
            } else {
                let folderType = $('.folders_div.selected').attr('data-id');
                let exsId = $('.exs-list-group').find('.list-group-item.active').attr('data-id');
                let dataToSend = {'edit_exs_custom': 1, 'exs': exsId, 'type': folderType, 'data': {}, 'mode': cId};
                $('#exerciseCard').find('.exs_edit_field').each((ind, elem) => {
                    if (!$(elem).hasClass('d-none') || $(elem).hasClass('selected')) {
                        let name = $(elem).attr('name');
                        if (name in dataToSend.data) {
                            if (!Array.isArray(dataToSend.data[name])) {
                                let tVal = dataToSend.data[name];
                                dataToSend.data[name] = [tVal];
                            }
                            dataToSend.data[name].push($(elem).val());
                        } else {
                            dataToSend.data[name] = $(elem).val();
                        }
                    }
                });
                dataToSend.data['description'] = document.descriptionEditorViewFromFolders.getData();
                dataToSend.data['description_template'] = document.descriptionEditor2Template.getData();
                dataToSend.data['description_trainer'] = document.descriptionEditorViewFromFoldersTrainer.getData();

                $('.page-loader-wrapper').fadeIn();
                $.ajax({
                    headers:{"X-CSRFToken": csrftoken},
                    data: dataToSend,
                    type: 'POST', // GET или POST
                    dataType: 'json',
                    url: "exercises_api",
                    success: function (res) {
                        if (res.success) {
                            LoadExerciseOneHandler();
                            swal("Готово", "Упражнение успешно изменено.", "success");
                        } else {
                            swal("Ошибка", `При изменении упражнения произошла ошибка (${res.err}).`, "error");
                        }
                    },
                    error: function (res) {
                        swal("Ошибка", "Упражнение не удалось изменить.", "error");
                        console.log(res);
                    },
                    complete: function (res) {
                        try {
                            document.descriptionEditorViewFromFolders.enableReadOnlyMode('');
                            $('#descriptionEditorViewFromFolders').next().find('.ck-editor__top').addClass('d-none');
                            $('#descriptionEditorViewFromFolders').next().find('.ck-content.ck-editor__editable').addClass('borders-off');
                            document.descriptionEditorViewFromFoldersTrainer.enableReadOnlyMode('');
                            $('#descriptionEditorViewFromFoldersTrainer').next().find('.ck-editor__top').addClass('d-none');
                            $('#descriptionEditorViewFromFoldersTrainer').next().find('.ck-content.ck-editor__editable').addClass('borders-off');
                        } catch(e) {}
                        $('.page-loader-wrapper').fadeOut();
                    }
                });
            }
        } else if (cId == "card") {
            if (!isSelected) {
                ToggleEditFields(true);
            } else {
                let folderType = $('.folders_div.selected').attr('data-id');
                let exsId = $('.exs-list-group').find('.list-group-item.active').attr('data-id');
                let dataToSend = {'edit_exs_custom': 1, 'exs': exsId, 'type': folderType, 'data': {}, 'mode': cId};
                $('#exerciseCard').find('.exs_edit_field').each((ind, elem) => {
                    if (!$(elem).hasClass('d-none') || $(elem).hasClass('selected')) {
                        let name = $(elem).attr('name');
                        if (name in dataToSend.data) {
                            if (!Array.isArray(dataToSend.data[name])) {
                                let tVal = dataToSend.data[name];
                                dataToSend.data[name] = [tVal];
                            }
                            dataToSend.data[name].push($(elem).val());
                        } else {
                            dataToSend.data[name] = $(elem).val();
                        }
                    }
                });
                if (dataToSend.data.title == "") {
                    swal("Внимание", "Добавьте название для упражнения.", "info");
                    return;
                }
                if (dataToSend.data.folder_parent == "" || dataToSend.data.folder_main == "") {
                    swal("Внимание", "Выберите папку для упражнения.", "info");
                    return;
                }
                let selectedCategories = [];
                $('#exerciseCard').find('tr.btn-fields').find('button.selected3[data-id="category"]').each((ind, elem) => {
                    selectedCategories.push($(elem).attr('data-val')); 
                });
                dataToSend.data['field_categories'] = selectedCategories;
            
                let selectedTypes = [];
                $('#exerciseCard').find('.exs-types-list > button.active').each((ind, elem) => {
                    selectedTypes.push($(elem).attr('data-id')); 
                });
                dataToSend.data['field_types'] = selectedTypes;

                let selectedPhysicalQualities = [];
                $('#exerciseCard').find('.physical-qualities-list > button.active').each((ind, elem) => {
                    selectedPhysicalQualities.push($(elem).attr('data-id')); 
                });
                dataToSend.data['field_physical_qualities'] = selectedPhysicalQualities;
            
                let selectedCognitiveLoads = [];
                $('#exerciseCard').find('.cognitive-load-list > button.active').each((ind, elem) => {
                    selectedCognitiveLoads.push($(elem).attr('data-id')); 
                });
                dataToSend.data['field_cognitive_loads'] = selectedCognitiveLoads;
            
                let selectedFields = [];
                $('#exerciseCard').find('.fields-list > button.active').each((ind, elem) => {
                    selectedFields.push($(elem).attr('data-id')); 
                });
                dataToSend.data['field_fields'] = selectedFields;
                if (Array.isArray(dataToSend.data['tags'])) {
                    for (let i = dataToSend.data['tags'].length-1; i >= 0; i--) {
                        if (Array.isArray(dataToSend.data['tags'][i])) {
                            dataToSend.data['tags'].splice(i, 1);
                        }
                    }
                }
                $('.page-loader-wrapper').fadeIn();
                $.ajax({
                    headers:{"X-CSRFToken": csrftoken},
                    data: dataToSend,
                    type: 'POST', // GET или POST
                    dataType: 'json',
                    url: "exercises_api",
                    success: function (res) {
                        if (res.success) {
                            LoadExerciseOneHandler();
                            swal("Готово", "Упражнение успешно изменено.", "success");
                        } else {
                            swal("Ошибка", `При изменении упражнения произошла ошибка (${res.err}).`, "error");
                        }
                    },
                    error: function (res) {
                        swal("Ошибка", "Упражнение не удалось изменить.", "error");
                        console.log(res);
                    },
                    complete: function (res) {
                        ToggleEditFields(false);
                        $('.page-loader-wrapper').fadeOut();
                    }
                });
            }
        }
        $(e.currentTarget).toggleClass('selected', !isSelected);
        $(e.currentTarget).toggleClass('btn-success', !isSelected);
        $(e.currentTarget).toggleClass('btn-secondary', isSelected);
        $(e.currentTarget).text(isSelected ? "Редактировать" : "Сохранить");

    });

    // Toggle left menu
    setTimeout(() => {
        $('#toggle_btn').click();
    }, 500);

    // Load exs count in folder
    if (window.lastExercise == null) {
        CountExsInFolder();
    }


    RenderFilterNewExs();


});
