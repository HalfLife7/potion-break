exports.seed = function (knex) {
    // Deletes ALL existing entries
    return knex('game_screenshots')
        .del()
        .then(function () {
            return knex('game_screenshots').insert([
                {
                    id: 0,
                    game_id: 570,
                    path_thumbnail:
                        'https://steamcdn-a.akamaihd.net/steam/apps/570/ss_86d675fdc73ba10462abb8f5ece7791c5047072c.600x338.jpg?t=1599609346',
                    path_full:
                        'https://steamcdn-a.akamaihd.net/steam/apps/570/ss_86d675fdc73ba10462abb8f5ece7791c5047072c.1920x1080.jpg?t=1599609346',
                },
                {
                    id: 1,
                    game_id: 570,
                    path_thumbnail:
                        'https://steamcdn-a.akamaihd.net/steam/apps/570/ss_ad8eee787704745ccdecdfde3a5cd2733704898d.600x338.jpg?t=1599609346',
                    path_full:
                        'https://steamcdn-a.akamaihd.net/steam/apps/570/ss_ad8eee787704745ccdecdfde3a5cd2733704898d.1920x1080.jpg?t=1599609346',
                },
                {
                    id: 2,
                    game_id: 570,
                    path_thumbnail:
                        'https://steamcdn-a.akamaihd.net/steam/apps/570/ss_7ab506679d42bfc0c0e40639887176494e0466d9.600x338.jpg?t=1599609346',
                    path_full:
                        'https://steamcdn-a.akamaihd.net/steam/apps/570/ss_7ab506679d42bfc0c0e40639887176494e0466d9.1920x1080.jpg?t=1599609346',
                },
                {
                    id: 3,
                    game_id: 570,
                    path_thumbnail:
                        'https://steamcdn-a.akamaihd.net/steam/apps/570/ss_c9118375a2400278590f29a3537769c986ef6e39.600x338.jpg?t=1599609346',
                    path_full:
                        'https://steamcdn-a.akamaihd.net/steam/apps/570/ss_c9118375a2400278590f29a3537769c986ef6e39.1920x1080.jpg?t=1599609346',
                },
                {
                    id: 4,
                    game_id: 570,
                    path_thumbnail:
                        'https://steamcdn-a.akamaihd.net/steam/apps/570/ss_f9ebafedaf2d5cfb80ef1f74baa18eb08cad6494.600x338.jpg?t=1599609346',
                    path_full:
                        'https://steamcdn-a.akamaihd.net/steam/apps/570/ss_f9ebafedaf2d5cfb80ef1f74baa18eb08cad6494.1920x1080.jpg?t=1599609346',
                },
                {
                    id: 5,
                    game_id: 570,
                    path_thumbnail:
                        'https://steamcdn-a.akamaihd.net/steam/apps/570/ss_27b6345f22243bd6b885cc64c5cda74e4bd9c3e8.600x338.jpg?t=1599609346',
                    path_full:
                        'https://steamcdn-a.akamaihd.net/steam/apps/570/ss_27b6345f22243bd6b885cc64c5cda74e4bd9c3e8.1920x1080.jpg?t=1599609346',
                },
                {
                    id: 6,
                    game_id: 570,
                    path_thumbnail:
                        'https://steamcdn-a.akamaihd.net/steam/apps/570/ss_b33a65678dc71cc98df4890e22a89601ee56a918.600x338.jpg?t=1599609346',
                    path_full:
                        'https://steamcdn-a.akamaihd.net/steam/apps/570/ss_b33a65678dc71cc98df4890e22a89601ee56a918.1920x1080.jpg?t=1599609346',
                },
                {
                    id: 7,
                    game_id: 570,
                    path_thumbnail:
                        'https://steamcdn-a.akamaihd.net/steam/apps/570/ss_d0f973ce376ca5b6c08e081cb035e86ced105fa9.600x338.jpg?t=1599609346',
                    path_full:
                        'https://steamcdn-a.akamaihd.net/steam/apps/570/ss_d0f973ce376ca5b6c08e081cb035e86ced105fa9.1920x1080.jpg?t=1599609346',
                },
                {
                    id: 8,
                    game_id: 570,
                    path_thumbnail:
                        'https://steamcdn-a.akamaihd.net/steam/apps/570/ss_1f3b5f5ccf8b159294914c3fe028128a787304b6.600x338.jpg?t=1599609346',
                    path_full:
                        'https://steamcdn-a.akamaihd.net/steam/apps/570/ss_1f3b5f5ccf8b159294914c3fe028128a787304b6.1920x1080.jpg?t=1599609346',
                },
                {
                    id: 9,
                    game_id: 570,
                    path_thumbnail:
                        'https://steamcdn-a.akamaihd.net/steam/apps/570/ss_e0a92f15a6631a8186df79182d0fe28b5e37d8cb.600x338.jpg?t=1599609346',
                    path_full:
                        'https://steamcdn-a.akamaihd.net/steam/apps/570/ss_e0a92f15a6631a8186df79182d0fe28b5e37d8cb.1920x1080.jpg?t=1599609346',
                },
                {
                    id: 0,
                    game_id: 435150,
                    path_thumbnail:
                        'https://steamcdn-a.akamaihd.net/steam/apps/435150/ss_b59e5889726cab2cf01a93d0c0d192d25928952a.600x338.jpg?t=1592914193',
                    path_full:
                        'https://steamcdn-a.akamaihd.net/steam/apps/435150/ss_b59e5889726cab2cf01a93d0c0d192d25928952a.1920x1080.jpg?t=1592914193',
                },
                {
                    id: 1,
                    game_id: 435150,
                    path_thumbnail:
                        'https://steamcdn-a.akamaihd.net/steam/apps/435150/ss_34a428cdd26113e8645b77331d9fc82fcc50a4a2.600x338.jpg?t=1592914193',
                    path_full:
                        'https://steamcdn-a.akamaihd.net/steam/apps/435150/ss_34a428cdd26113e8645b77331d9fc82fcc50a4a2.1920x1080.jpg?t=1592914193',
                },
                {
                    id: 2,
                    game_id: 435150,
                    path_thumbnail:
                        'https://steamcdn-a.akamaihd.net/steam/apps/435150/ss_66d58326ebea7154d7f3d89e02f13913452caef7.600x338.jpg?t=1592914193',
                    path_full:
                        'https://steamcdn-a.akamaihd.net/steam/apps/435150/ss_66d58326ebea7154d7f3d89e02f13913452caef7.1920x1080.jpg?t=1592914193',
                },
                {
                    id: 3,
                    game_id: 435150,
                    path_thumbnail:
                        'https://steamcdn-a.akamaihd.net/steam/apps/435150/ss_d3badb07717f13ef3316928c513f8c4c7f7b50b1.600x338.jpg?t=1592914193',
                    path_full:
                        'https://steamcdn-a.akamaihd.net/steam/apps/435150/ss_d3badb07717f13ef3316928c513f8c4c7f7b50b1.1920x1080.jpg?t=1592914193',
                },
                {
                    id: 4,
                    game_id: 435150,
                    path_thumbnail:
                        'https://steamcdn-a.akamaihd.net/steam/apps/435150/ss_d51d3ccb39019124c45bf851bbe6a76e2461fab3.600x338.jpg?t=1592914193',
                    path_full:
                        'https://steamcdn-a.akamaihd.net/steam/apps/435150/ss_d51d3ccb39019124c45bf851bbe6a76e2461fab3.1920x1080.jpg?t=1592914193',
                },
                {
                    id: 5,
                    game_id: 435150,
                    path_thumbnail:
                        'https://steamcdn-a.akamaihd.net/steam/apps/435150/ss_a0fa5dd2f40fffbae32af259afcf588a999e6663.600x338.jpg?t=1592914193',
                    path_full:
                        'https://steamcdn-a.akamaihd.net/steam/apps/435150/ss_a0fa5dd2f40fffbae32af259afcf588a999e6663.1920x1080.jpg?t=1592914193',
                },
                {
                    id: 6,
                    game_id: 435150,
                    path_thumbnail:
                        'https://steamcdn-a.akamaihd.net/steam/apps/435150/ss_efa99b837c22f45f690f27d3c656de31a4446075.600x338.jpg?t=1592914193',
                    path_full:
                        'https://steamcdn-a.akamaihd.net/steam/apps/435150/ss_efa99b837c22f45f690f27d3c656de31a4446075.1920x1080.jpg?t=1592914193',
                },
                {
                    id: 7,
                    game_id: 435150,
                    path_thumbnail:
                        'https://steamcdn-a.akamaihd.net/steam/apps/435150/ss_5034004fa3690a17da2c266bc577e8aa54e2f3ef.600x338.jpg?t=1592914193',
                    path_full:
                        'https://steamcdn-a.akamaihd.net/steam/apps/435150/ss_5034004fa3690a17da2c266bc577e8aa54e2f3ef.1920x1080.jpg?t=1592914193',
                },
                {
                    id: 8,
                    game_id: 435150,
                    path_thumbnail:
                        'https://steamcdn-a.akamaihd.net/steam/apps/435150/ss_5ba36377bbb88fdde6c9e9ccddb581d3a952ea6a.600x338.jpg?t=1592914193',
                    path_full:
                        'https://steamcdn-a.akamaihd.net/steam/apps/435150/ss_5ba36377bbb88fdde6c9e9ccddb581d3a952ea6a.1920x1080.jpg?t=1592914193',
                },
                {
                    id: 9,
                    game_id: 435150,
                    path_thumbnail:
                        'https://steamcdn-a.akamaihd.net/steam/apps/435150/ss_d882a5136e99c31ac7192cd3648b0d547be53f0e.600x338.jpg?t=1592914193',
                    path_full:
                        'https://steamcdn-a.akamaihd.net/steam/apps/435150/ss_d882a5136e99c31ac7192cd3648b0d547be53f0e.1920x1080.jpg?t=1592914193',
                },
                {
                    id: 10,
                    game_id: 435150,
                    path_thumbnail:
                        'https://steamcdn-a.akamaihd.net/steam/apps/435150/ss_9f7699218d7acc9e1dd0a081d3a2c5cae4ffba86.600x338.jpg?t=1592914193',
                    path_full:
                        'https://steamcdn-a.akamaihd.net/steam/apps/435150/ss_9f7699218d7acc9e1dd0a081d3a2c5cae4ffba86.1920x1080.jpg?t=1592914193',
                },
                {
                    id: 11,
                    game_id: 435150,
                    path_thumbnail:
                        'https://steamcdn-a.akamaihd.net/steam/apps/435150/ss_f85eb1d28993d481dcde84118f5ac23c705a8774.600x338.jpg?t=1592914193',
                    path_full:
                        'https://steamcdn-a.akamaihd.net/steam/apps/435150/ss_f85eb1d28993d481dcde84118f5ac23c705a8774.1920x1080.jpg?t=1592914193',
                },
                {
                    game_id: 546560,
                    id: 0,
                    path_thumbnail:
                        'https://steamcdn-a.akamaihd.net/steam/apps/546560/ss_d61365e93f20ceb5a94a1e5b2811cf504cbfa303.600x338.jpg?t=1594314571',
                    path_full:
                        'https://steamcdn-a.akamaihd.net/steam/apps/546560/ss_d61365e93f20ceb5a94a1e5b2811cf504cbfa303.1920x1080.jpg?t=1594314571',
                },
                {
                    game_id: 546560,
                    id: 1,
                    path_thumbnail:
                        'https://steamcdn-a.akamaihd.net/steam/apps/546560/ss_fe7066404a704aa20f7c6f251facb7aef2606bda.600x338.jpg?t=1594314571',
                    path_full:
                        'https://steamcdn-a.akamaihd.net/steam/apps/546560/ss_fe7066404a704aa20f7c6f251facb7aef2606bda.1920x1080.jpg?t=1594314571',
                },
                {
                    game_id: 546560,
                    id: 2,
                    path_thumbnail:
                        'https://steamcdn-a.akamaihd.net/steam/apps/546560/ss_6868ae1644628f857e7df4b72a00fdf506f79c7f.600x338.jpg?t=1594314571',
                    path_full:
                        'https://steamcdn-a.akamaihd.net/steam/apps/546560/ss_6868ae1644628f857e7df4b72a00fdf506f79c7f.1920x1080.jpg?t=1594314571',
                },
                {
                    game_id: 546560,
                    id: 3,
                    path_thumbnail:
                        'https://steamcdn-a.akamaihd.net/steam/apps/546560/ss_4236773ab28112613bd7d4c6282331c861bc222a.600x338.jpg?t=1594314571',
                    path_full:
                        'https://steamcdn-a.akamaihd.net/steam/apps/546560/ss_4236773ab28112613bd7d4c6282331c861bc222a.1920x1080.jpg?t=1594314571',
                },
                {
                    game_id: 546560,
                    id: 4,
                    path_thumbnail:
                        'https://steamcdn-a.akamaihd.net/steam/apps/546560/ss_5d228b092e93ff148e6a998c33e751fb968cc956.600x338.jpg?t=1594314571',
                    path_full:
                        'https://steamcdn-a.akamaihd.net/steam/apps/546560/ss_5d228b092e93ff148e6a998c33e751fb968cc956.1920x1080.jpg?t=1594314571',
                },
                {
                    game_id: 546560,
                    id: 5,
                    path_thumbnail:
                        'https://steamcdn-a.akamaihd.net/steam/apps/546560/ss_70fce3236bf252d3814f793744f648cbe35164e4.600x338.jpg?t=1594314571',
                    path_full:
                        'https://steamcdn-a.akamaihd.net/steam/apps/546560/ss_70fce3236bf252d3814f793744f648cbe35164e4.1920x1080.jpg?t=1594314571',
                },
                {
                    game_id: 546560,
                    id: 6,
                    path_thumbnail:
                        'https://steamcdn-a.akamaihd.net/steam/apps/546560/ss_fcc7a64234b8b26cac3d69dfc4779dd438582f15.600x338.jpg?t=1594314571',
                    path_full:
                        'https://steamcdn-a.akamaihd.net/steam/apps/546560/ss_fcc7a64234b8b26cac3d69dfc4779dd438582f15.1920x1080.jpg?t=1594314571',
                },
                {
                    game_id: 546560,
                    id: 7,
                    path_thumbnail:
                        'https://steamcdn-a.akamaihd.net/steam/apps/546560/ss_0360004603a7861cf6781d5449e641f916f1ee07.600x338.jpg?t=1594314571',
                    path_full:
                        'https://steamcdn-a.akamaihd.net/steam/apps/546560/ss_0360004603a7861cf6781d5449e641f916f1ee07.1920x1080.jpg?t=1594314571',
                },
                {
                    game_id: 546560,
                    id: 8,
                    path_thumbnail:
                        'https://steamcdn-a.akamaihd.net/steam/apps/546560/ss_e5152f19710aaa91c4a4ab161785af3e1f8d850d.600x338.jpg?t=1594314571',
                    path_full:
                        'https://steamcdn-a.akamaihd.net/steam/apps/546560/ss_e5152f19710aaa91c4a4ab161785af3e1f8d850d.1920x1080.jpg?t=1594314571',
                },
                {
                    game_id: 546560,
                    id: 9,
                    path_thumbnail:
                        'https://steamcdn-a.akamaihd.net/steam/apps/546560/ss_ac80dfaacaade35a1da835dadd52ab420607603b.600x338.jpg?t=1594314571',
                    path_full:
                        'https://steamcdn-a.akamaihd.net/steam/apps/546560/ss_ac80dfaacaade35a1da835dadd52ab420607603b.1920x1080.jpg?t=1594314571',
                },
                {
                    game_id: 546560,
                    id: 10,
                    path_thumbnail:
                        'https://steamcdn-a.akamaihd.net/steam/apps/546560/ss_ddc667aa2687543c0baa1a63c6bdb5fa59e0617e.600x338.jpg?t=1594314571',
                    path_full:
                        'https://steamcdn-a.akamaihd.net/steam/apps/546560/ss_ddc667aa2687543c0baa1a63c6bdb5fa59e0617e.1920x1080.jpg?t=1594314571',
                },
                {
                    game_id: 546560,
                    id: 11,
                    path_thumbnail:
                        'https://steamcdn-a.akamaihd.net/steam/apps/546560/ss_4912f4c3d259a472e9898f0a7b1f819a533d2c1e.600x338.jpg?t=1594314571',
                    path_full:
                        'https://steamcdn-a.akamaihd.net/steam/apps/546560/ss_4912f4c3d259a472e9898f0a7b1f819a533d2c1e.1920x1080.jpg?t=1594314571',
                },
            ])
        })
}
