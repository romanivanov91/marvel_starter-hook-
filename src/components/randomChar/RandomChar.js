import { Component } from 'react';
import Spinner from '../spinner/Spinner';
import ErrorMessage from '../errorMessage/ErrorMessage';
import MarvelService from '../../services/MarvelService';

import './randomChar.scss';
import mjolnir from '../../resources/img/mjolnir.png';

//Создаем класс
class RandomChar extends Component {
    //Временное решение по запуску updateChar  при загрузке страницы/. Правильно вызывать this.updateChar() в хуке componentDidMount()
    // constructor (props) {
    //     super(props);
    //      this.updateChar();
    // }

    componentDidMount() {
        this.updateChar();
        // this.timerId = setInterval(this.updateChar, 5000);
        // console.log('mount');
    }

    // componentWillUnmount() {
    //     clearInterval(this.timerId);
    //     console.log('unmount');
    // }

    //Задаем начальные состояния переменных
    state = {
        char:{},//Изначально данные персонажа пусты
        loading: true,//Пока персонаж не загрузился, показываем спиннер. true - не загрузился
        error: false//Сначало ошибка отсутствует. false - нет ошибки, true - произошла ошибка загрузки
    }

    //Используем сервис MarvelService, чтобы получить данные с сервера
    marvelService = new MarvelService();

    //Метод обновление данных state для универсальности исползования
    onCharLoaded = (char) => {
        this.setState({
            char, 
            loading: false//когда персонаж загрузился, то убираем спиннер и показываем контент
        })
    }

    onCharLoading = () => {
        this.setState({
            loading: true//пока персонаж грузится, то показываем спиннер
        })
    }

    //Метод записывающий в state error: true для того чтобы отобразить ошибку
    onError = () => {
        this.setState({
            loading: false,//если персонаж не загрузился, то убираем спиннер
            error: true// и показываем текст или изображение ошибки
        })
    }

    updateChar = () => {
        const id = Math.floor(Math.random() * (1011400-1011000) + 1011000);
        this.onCharLoading();
        this.marvelService
        .getCharacter(id)//приходят удобные данные. см. MarvelService
        .then(this.onCharLoaded)//персонаж загрузился
        .catch(this.onError)//произошла ошибка загрузки персонажа
    }



    render() {
        const {char, loading, error} = this.state;
        const errorMessage = error ? <ErrorMessage/> : null;//если error из state - true, то выводим сообщение или картинку об ошибке, в противном случае ничего не выводим
        const spinner = loading ? <Spinner/> : null;//если loading из state - true, то выводим спиннер, в противном случае ничего не выводим
        const content = !(loading || error) ? <View char={char}/> : null; //если loading из state - false и error из state - false, то есть все загрузилось и нет никаких ошибок, то выводим контент

        return (
            <div className="randomchar">
                {errorMessage}
                {spinner}
                {content}
                <div className="randomchar__static">
                    <p className="randomchar__title">
                        Random character for today!<br/>
                        Do you want to get to know him better?
                    </p>
                    <p className="randomchar__title">
                        Or choose another one
                    </p>
                    <button onClick={this.updateChar} className="button button__main">
                        <div className="inner">try it</div>
                    </button>
                    <img src={mjolnir} alt="mjolnir" className="randomchar__decoration"/>
                </div>
            </div>
        )
    }
}

const View = ({char}) => {

    const {name, description, thumbnail, homepage, wiki} = char;
    let imgStyle = {'objectFit' : 'cover'};//Начальное значение objectFit
    //Условие при котором objectFit меняется если у свойства персонажа дана ссылка на заглушку
    if (thumbnail === 'http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available.jpg') {
        imgStyle = {'objectFit' : 'contain'};
    }

    return (
        <div className="randomchar__block">
            <img style={imgStyle} src={thumbnail} alt="Random character" className="randomchar__img"/>
            <div className="randomchar__info">
                <p className="randomchar__name">{name}</p>
                <p className="randomchar__descr">
                {description}
                </p>
                <div className="randomchar__btns">
                    <a href={homepage} className="button button__main">
                        <div className="inner">homepage</div>
                    </a>
                    <a href={wiki} className="button button__secondary">
                        <div className="inner">Wiki</div>
                    </a>
                </div>
            </div>
        </div>
    )
}

export default RandomChar;