import MarvelService from '../../services/MarvelService';
import React, { Component } from 'react';
import Spinner from '../spinner/Spinner';
import ErrorMessage from '../errorMessage/ErrorMessage';
import PropTypes from 'prop-types'

import './charList.scss';

class CharList extends Component {

    //Задаем начальные состояния переменных
    state = {
        charList:[],//Изначально данные персонажа пусты
        loading: true,//Пока персонаж не загрузился, показываем спиннер. true - не загрузился
        error: false,//Сначало ошибка отсутствует. false - нет ошибки, true - произошла ошибка загрузки
        newItemLoading: false,//Новые персонажи не подгружаются
        offset: 0,//начальный отступ
        charEnded: false//false - персонажи для подгрузки есть, true - персонажи для подгрузки отсутствуют (для блокировки кнопки подгрузки)
    }

    


    //Первоначальный запрос на сервер для формирования контента
    componentDidMount() {
       this.onRequest();//Первый запрос с базовым offset, который задан в MarvelService
    //    window.addEventListener('scroll', this.onScroll); //обработчик события скрола до низа страницы и подгрузки новых персонажей
    //    console.log('mount');
    }



    componentWillUnmount() {
        // window.removeEventListener('scroll', this.onScroll);//Удаление обработчика события при полной перерисовке компонента
        console.log('Unmount');
    }

    // onScroll = () => {
    //     if (window.pageYOffset + document.documentElement.clientHeight >= document.documentElement.scrollHeight) {
    //         const offset = this.state.offset;
    //         console.log(offset + ' до');
    //         this.onRequest(offset);
    //         console.log(offset + ' после');
    //      }
        
    // }

    //Метод запроса на сервер с заданным offset
    onRequest = (offset) => {
        this.onCharListLoading();
        this.marvelService
       .getAllCharacters(offset)
       .then(this.onCharListLoaded)
       .catch(this.onError);
    }

    
    //Используем сервис MarvelService, чтобы получить данные с сервера
    marvelService = new MarvelService();

    //Метод на время подгрузки новых персонажей
    onCharListLoading = () => {
        this.setState({
            newItemLoading:true//новые персонажи подгружаются
        })
    }

    //Метод обновление данных state для универсальности использования
    onCharListLoaded = (newCharList) => {
        let ended = false;
        if (newCharList.length < 9) {
            ended = true;
        }
        this.setState(({charList, offset}) => ({
            charList: [...charList, ...newCharList], //добавляем к существующему charlist новые данные
            loading: false,//когда персонаж загрузился, то убираем спиннер и показываем контент
            newItemLoading: false,//новые персонажи не подгружаются
            offset: offset + 9,//изменяем начальный отступ персонажей на 9 позиций
            charEnded: ended
        }))
    }

    //Метод записывающий в state error: true для того чтобы отобразить ошибку
    onError = () => {
        this.setState({
            loading: false,//если персонаж не загрузился, то убираем спиннер
            error: true// и показываем текст или изображение ошибки
        })
    }

    itemRefs = [];//Массив куда добавляются элементы li в методе renderItems

    //Метод который добавляет элементы li из метода renderItems
    setRef = (ref) => {
        this.itemRefs.push(ref);
    }

    //Метод удаляющий класс активности из всех элементов li из метода renderItems и добавляет его же к элементу li на который кликнули
    focusOnItem = (id) => {
        //Ниже коментарий от Ивана Петреченко
        // Я реализовал вариант чуть сложнее, и с классом и с фокусом
        // Но в теории можно оставить только фокус, и его в стилях использовать вместо класса
        // На самом деле, решение с css-классом можно сделать, вынеся персонажа
        // в отдельный компонент. Но кода будет больше, появится новое состояние
        // и не факт, что мы выиграем по оптимизации за счет бОльшего кол-ва элементов

        // По возможности, не злоупотребляйте рефами, только в крайних случаях
        this.itemRefs.forEach(item => item.classList.remove('char__item_selected'));
        this.itemRefs[id].classList.add('char__item_selected');
        this.itemRefs[id].focus();
    }

    renderItems = (arr) => {
        const items= arr.map((item, i) => {
            let imgStyle = {'objectFit' : 'cover'};//Начальное значение objectFit
            //Условие при котором objectFit меняется если у свойства персонажа дана ссылка на заглушку
            if (item.thumbnail === 'http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available.jpg') {
            imgStyle = {'objectFit' : 'unset'};
            }
            return (
                <li
                    //Свойство чтобы можно было выбирать элемент нажатием на tab
                    tabIndex={0}
                    //ref - вызывает функцию setRef которая добавляет в массив itemRefs данный элемент li
                    ref={this.setRef}
                    className="char__item" 
                    key={item.id} 
                    onClick={()=>
                    {this.props.onCharSelected(item.id);
                    this.focusOnItem(i)}}
                    //onKeyPress - обработчик события для выбора элемента страницы нажатием на tab
                    onKeyPress={(e) => {
                        if (e.key === ' ' || e.key === "Enter") {
                            this.props.onCharSelected(item.id);
                            this.focusOnItem(i);
                        }
                    }}
                    >
                    <img style={imgStyle} src={item.thumbnail} alt={item.name}/>
                    <div className="char__name">{item.name}</div>
                </li>
            )
        })
        // А эта конструкция вынесена для центровки спиннера/ошибки
        return (
            <ul className="char__grid">
                {items}
            </ul>
        )
    }


    render() {
        const {charList, loading, error, offset, newItemLoading, charEnded} = this.state;

        const spisok = this.renderItems(charList);

        const errorMessage = error ? <ErrorMessage/> : null;//если error из state - true, то выводим сообщение или картинку об ошибке, в противном случае ничего не выводим
        const spinner = loading ? <Spinner/> : null;//если loading из state - true, то выводим спиннер, в противном случае ничего не выводим
        const content = !(loading || error) ? spisok : null; //если loading из state - false и error из state - false, то есть все загрузилось и нет никаких ошибок, то выводим контент

        return (
            <div className="char__list">
                {spinner}
                {errorMessage}
                {content}
                <button 
                    className="button button__main button__long"
                    disabled={newItemLoading}
                    style={{'display' : charEnded ? 'none' : 'block'}}
                    onClick={() => this.onRequest(offset)}>
                    <div className="inner">load more</div>
                </button>
            </div>
        )
    }
}

//Проверка типов с помощью PropTypes
CharList.protoTypes = {
    onCharSelected: PropTypes.func.isRequired
}


export default CharList;