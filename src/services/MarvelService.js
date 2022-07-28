class MarvelService {
    _apiBase = 'https://gateway.marvel.com:443/v1/public/';
    _apiKey = 'apikey=d04fa5daa548e140a4c68e1b1b1a47f2';
    _baseOffset = 0;
    getResource = async (url) => {
        let res = await fetch(url);

        if(!res.ok) {
            throw new Error(`Could not fetch ${url}, status ${res.status}`);
        }

        return await res.json();
    }

    //Метод по получение данных нескольких персонажей (в данном случае 9 limit=9 и отступом 250 персонажей от начала offset=250).Метод должен дождаться данных с севрера поэтому используем async и await
    getAllCharacters = async (offset = this._baseOffset) => {
        const res = await this.getResource(`${this._apiBase}characters?limit=9&offset=${offset}&${this._apiKey}`);
        return res.data.results.map(this._transformeCharacter);//Перебираем каждые элемент массива и переобрауем в удобный нам формат при помощи метода _transformeCharacter
    }

    //Метод по получению однго конкретного персонажа. Метод должен дождаться данных с севрера поэтому используем async и await
    getCharacter = async (id) => {
        const res = await this.getResource(`${this._apiBase}characters/${id}?${this._apiKey}`);
        return this._transformeCharacter(res.data.results[0]);//res.data.results[0] - объект персонажа 
    }

    //Метод трансформирующий данные по персонажу в удобный нам формат
    _transformeCharacter = (char) => {
        if (char.description === '') {
            char.description = 'Описание отсутствует'
        } else if (char.description.length > 210) {
            char.description = char.description.substr(0, 210) + '...'
        }
        return {
            id: char.id,
            name: char.name,
            description: char.description,
            thumbnail: char.thumbnail.path + '.' + char.thumbnail.extension,
            homepage: char.urls[0].url,
            wiki: char.urls[1].url,
            comics: char.comics.items
        }
    }

}

export default MarvelService;