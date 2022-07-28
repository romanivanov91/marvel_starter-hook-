import { Component } from 'react';
import MarvelService from '../../services/MarvelService';
import Spinner from '../spinner/Spinner';
import ErrorMessage from '../errorMessage/ErrorMessage';
import Skeleton from '../skeleton/Skeleton';

import './charInfo.scss';

class CharInfo extends Component {

     //Задаем начальные состояния переменных
     state = {
        char:null,//Изначально данные персонажа пусты, в данном случае устанавливаем null так как, чтобы отображать скелетон, нам надо в условии skeleton из render в значении char в  false, а просто пустой объект - это true
        loading: false,//Пока персонаж не загрузился, показываем скелетон. Загрузка пойдет только по клику пользователя
        error: false//Сначало ошибка отсутствует. false - нет ошибки, true - произошла ошибка загрузки
    }

    componentDidMount() {
        this.updateChar();
    }

    //хук жизненного цикла, который вызывается при обновлении props или state componentDidUpdate(prevProps, prevState){}. Нужно осторожно использовать с условием сранение старых данных с новыми. Если не использовать сравнение то можно бесконечно зациклить приложение и оно зависнет
    componentDidUpdate(prevProps) {
        if (this.props.charId !== prevProps.charId) {
            this.updateChar();
        }
    }

    //Используем сервис MarvelService, чтобы получить данные с сервера
    marvelService = new MarvelService();

    updateChar = () => {
        const {charId} = this.props;//Получаем id персонажа из App
        //Если Id персонажа нету то останавливаем метот 
        if (!charId) {
            return;
        }
        this.onCharLoading();
        this.marvelService
        .getCharacter(charId)
        .then(this.onCharLoaded)
        .catch(this.onError);
    }

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

    render() {
        const {char, loading, error}=this.state;

        const skeleton = char || loading || error ? null : <Skeleton/>//Если персонаж не загружен, нет загрузки и нету ошибки по показываем скелетон
        const errorMessage = error ? <ErrorMessage/> : null;//если error из state - true, то выводим сообщение или картинку об ошибке, в противном случае ничего не выводим
        const spinner = loading ? <Spinner/> : null;//если loading из state - true, то выводим спиннер, в противном случае ничего не выводим
        const content = !(loading || error || !char) ? <View char={char}/> : null; //если loading из state - false и error из state - false и есть char из state, то есть все загрузилось и нет никаких ошибок, то выводим контент
    
        return (
            <div className="char__info">
                {skeleton}
                {errorMessage}
                {spinner}
                {content}
            </div>
        )
    }
}

//Выносим в отдельный компонент верстку
const View = ({char}) => {

    const {name, thumbnail, homepage, wiki, description, comics} = char;

    let imgStyle = {'objectFit' : 'cover'};//Начальное значение objectFit
    //Условие при котором objectFit меняется если у свойства персонажа дана ссылка на заглушку
    if (thumbnail === 'http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available.jpg') {
        imgStyle = {'objectFit' : 'contain'};
    }

    return(
        <>
            <div className="char__basics">
                <img style={imgStyle} src={thumbnail} alt={name}/>
                <div>
                    <div className="char__info-name">{name}</div>
                    <div className="char__btns">
                        <a href={homepage} className="button button__main">
                            <div className="inner">homepage</div>
                        </a>
                        <a href={wiki} className="button button__secondary">
                            <div className="inner">Wiki</div>
                        </a>
                    </div>
                </div>
                </div>
                <div className="char__descr">
                    {description}
                </div>
                <div className="char__comics">Comics:</div>
                <ul className="char__comics-list">
                    {comics.length > 0 ? null : 'Комиксы отсутствуют'}
                    {
                        comics.slice(0, 10).map((item, index) => {//slice - обрезает массив до 10 элементов
                            return (
                                <li className="char__comics-item" key={index}>
                                    {item.name}
                                </li>
                            )
                        })
                    }
                </ul>
        </>
    )
}

export default CharInfo;