exports.seed = function (knex) {
    // Deletes ALL existing entries
    return knex('charities')
        .del()
        .then(function () {
            return knex('charities').insert([
                {
                    id: '1',
                    name: 'NPR',
                    description:
                        'NPR is an independent, nonprofit media organization that was founded on a mission to create a more informed public. Every day, NPR connects with millions of Americans on the air, online, and in person to explore the news, ideas, and what it means to be human.',
                    img_path: '/images/charities/npr.svg',
                },
                {
                    id: '2',
                    name: 'Nature Conservancy Canada',
                    description:
                        "The Nature Conservancy of Canada (NCC) is Canada's leading national land conservation organization. A private, non-profit organization, we partner with individuals, corporations, foundations, Indigenous communities and other non-profit organizations and governments at all levels to protect our most important natural treasures — the natural areas that sustain Canada’s plants and wildlife. We secure properties (through donation, purchase, conservation agreement and the relinquishment of other legal interests in land) and manage them for the long term.",
                    img_path: '/images/charities/ncc.svg',
                },
                {
                    id: '3',
                    name: 'Ontario SPCA',
                    description:
                        'The Ontario SPCA and Humane Society is a registered charity, established in 1873. The Society and its network of communities facilitate and provide for province-wide leadership on matters relating to the prevention of cruelty to animals and the promotion of animal well-being. Offering a variety of mission-based programs, including community-based sheltering, animal wellness services, provincial animal transfers, shelter health & wellness, high-volume spay/neuter services, animal rescue, animal advocacy, Indigenous partnership programs and humane education, the Ontario SPCA is Ontario’s animal charity.',
                    img_path: '/images/charities/spca.png',
                },
                {
                    id: '4',
                    name: 'WWF Canada',
                    description:
                        'World Wildlife Fund Canada is the country’s largest international conservation organization. Using the best scientific analysis and indigenous guidance, we work to conserve species at risk, protect threatened habitats, and address climate change. Our long-term vision is simple: to create a world where people and nature thrive.',
                    img_path: '/images/charities/wwf.png',
                },
                {
                    id: '5',
                    name: 'PBS',
                    description:
                        'PBS is a membership organization that, in partnership with its member stations, serves the American public with programming and services of the highest quality, using media to educate, inspire, entertain and express a diversity of perspectives.',
                    img_path: '/images/charities/pbs.svg',
                },
            ])
        })
}
