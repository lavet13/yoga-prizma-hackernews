import {
  Resolvers,
  Episode,
  LengthUnit,
  Review,
  Human,
  Droid,
  Starship,
} from '../../__generated__/types';

const reviews: Review[] = [];

const friends: (Human | Droid)[] = [
  {
    id: '3',
    name: 'Ivan',
    appearsIn: [Episode.Newhope],
    friends: [],
    totalCredits: 123,
    starships: [],
  },
];

const heros: (Human | Droid)[] = [
  {
    id: '1',
    name: 'R2-D2',
    appearsIn: [Episode.Jedi, Episode.Empire],
    friends: [friends[0]],
    primaryFunction: 'ANDROID STUFF',
  },
  {
    id: '2',
    name: 'Luke Skywalker',
    appearsIn: [Episode.Empire, Episode.Newhope],
    friends: [],
    totalCredits: 2,
    starships: [
      { id: '3000', name: 'X-Wing', length: 1.5 },
      { id: '3003', name: 'Imperial Shuttle', length: 2 },
    ],
  },
];

const isHuman = (character: Human | Starship | Droid): character is Human => {
  return (character as Human).starships !== undefined;
};

const getCharactersAndFriends = (
  hero: Human | Droid,
): (Human | Droid | Starship)[] => {
  if (!hero) return [];

  const friendsAndTheirFriends = hero.friends
    .flatMap(friend => getCharactersAndFriends(friend as Human | Droid))
    .filter(Boolean) as (Human | Droid)[];

  return [
    ...new Set([
      hero,
      ...friendsAndTheirFriends,
      ...(isHuman(hero) ? hero.starships : []),
    ]),
  ];
};

const allCharacters = heros.flatMap(hero => getCharactersAndFriends(hero));
console.log({ allCharacters });

const resolvers: Resolvers = {
  Query: {
    hero(_, args) {
      const { episode } = args;

      switch (episode) {
        case Episode.Jedi:
          return heros.filter(hero => hero.appearsIn.includes(Episode.Jedi));

        case Episode.Empire:
          return heros.filter(hero => hero.appearsIn.includes(Episode.Empire));

        case Episode.Newhope:
          return heros.filter(hero => hero.appearsIn.includes(Episode.Newhope));
      }
    },

    heroById(_, args) {
      const { id: findId } = args;

      return heros.find(({ id }) => id === findId)!;
    },

    reviews() {
      return reviews;
    },

    search(_, args) {
      const { query } = args;

      return allCharacters.filter(character => character!.name.includes(query));
    },
  },
  Mutation: {
    createReview(_, args) {
      const { episode, review } = args;
      console.log({ episode, review });

      reviews.push(review);
      console.log({ reviews });

      return review;
    },
    incrementCredits(_, args) {
      const { id: findId } = args;

      const foundHuman = heros.find(({ id }) => id === findId)!;

      if(isHuman(foundHuman)) {
        return ++foundHuman.totalCredits;
      }

      throw new Error('This isn\'t a type of Human!');
    },
  },
  Character: {
    __resolveType(character, context, info) {
      if ((character as any).starships) {
        return 'Human';
      } else if ((character as any).primaryFunction) {
        return 'Droid';
      } else {
        throw new Error('Unable to determine character type!');
      }
    },
  },
  SearchResult: {
    __resolveType(character) {
      if ((character as Human).starships) {
        return 'Human';
      } else if ((character as Droid).primaryFunction) {
        return 'Droid';
      } else if ((character as Starship).length) {
        return 'Starship';
      } else {
        throw new Error('Unable to determine character type!');
      }
    },
  },
  Human: {
    starships(parent) {
      return parent.starships;
    },
  },
  Starship: {
    id(parent) {
      return parent.id;
    },
    length(parent, args) {
      const { unit } = args;

      switch (unit) {
        case LengthUnit.Centimeters:
          return parent.length * 100;

        case LengthUnit.Meter:
          return parent.length * 1;
      }
    },
  },
};

export default resolvers;
