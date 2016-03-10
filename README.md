# Оптимальное использование SASS на проектах Magento

## 1. Не использовать Compass

Если в проекте не используются спрайты генерируемые Compass или любые другие функции/плагины где есть работа с файлами то есть смысл отказаться от него в пользу использования [libSass](http://sass-lang.com/libsass)
Если в теме используются файлы из дефолтной rwd мадженто темы, то возникнет проблема. Перестанут работать компасовские импорты, миксины и функции. Это легко решаемо, достаточно бросить в папку scss содержимое папки lib из этого проекта https://github.com/Igosuki/compass-mixins
Для автоматической сборки я использую [Gulp](http://gulpjs.com). Я добавил для примера файлы настроек и потом раскажу как ими пользоваться.

## 2. Использовать переменные

Все знают, но почему-то не всегда все используют (даже я этим грешу). Название переменных дожно нести смысловую нагрузку, если занчение какого-то свойства используется больше трех раз уже имеет смысл сделать переменую. 

## 3. Лучше структурировать файлы

Если за основу взята дефолтная rwd тема, то в принципе этот пункт можно опустить. 
Нужно использовать всю мощь `@import`. За основу можно взять структу из rwd или придумать свою. Основная идея — каждый файл должен содержать минимум строк кода. Если файл содержит больше 1000 строк кода, лучше его побить.
Например ваш `_product-view.scss` можно побить как минимум на три части:
```
product-view/
|--_product-info.scss
|--_product-media.scss
|--_product-related.scss
```
И в самом файле `_product-view.scss` делаем импорты
```scss
@import "product-view";
@import "product-media";
@import "product-related";

... пишем код дальше ...

```

## 4. Меньше использовать миксины
 
Если ваш миксин не принимает ни каких значений — значит это не миксин и нужны в нет.
Этим грешит даже rwd тема. Самый жестокий пример `skin/frontend/rwd/default/scss/mixin/_clearfix.scss` который содержит
```scss
// NOTICE OF LICENSE
// =============================================
// Mixin - Clearfix
// =============================================

// This mixin is intended to be applied to an :after pseudo-class. Example:
//  &:after {
//      @include clearfix;
//  }
@mixin clearfix {
    content: '';
    display: table;
    clear: both;
}
```
И на выходе у нас 50 раз повторяеться 
```css
someselector:after {
  content: '';
  display: table;
  clear: both;
}
```
Для такого лучше использовать @extend и плейсхолдеры
```scss
%clearfix {
    &:before,
    &:after {
        content: '';
        display: table;
    }
    &:after {
        clear: both;
    }
}
someselector{
    @extend:%clearfix;
}
```
И на выходе оно сгрупирует все селекторы которые используют этот экстенд в одно правило


## 5. Быть окуратными с extend

Выше я писал про использование `@extend` но сним тоже можно наломать дров. Extend лучше использовать в паре с плейсхолдером. Если мы используем extend реального селетора то нужно быть аккуратным. Если селектор был вложен в другой селектор, вы унаследуюте и его вложенность
```
.link { 
    color:blue; 
}
header {
    .link {
        color:red;
    }
}
.button { 
    @extend .link  
}
```
На выходе мы получим
```
.link,
.button {
  color:blue
}
header .link,
header .button {
  color:red
}
```
С одной стороны это хорошо, если мы ожидали такого поведения и этого добивались. Но что будет если придет другой человек и без задней мысли добавит правило
```scss
.product-list {
    .link {
        div {
            display: inline;
        }
    }
}
```
На выходе мы получаем еще пачку
```css
.product-list .link div,
.product-list .button div{ 
    display:inline
}
```
И так незаметно наш файл стилей будет разрастатся не используемыми правилами. И если вы поддерживаете IE9 то в скором времени вы можете столкнуться с багом [4095 rules](https://blogs.msdn.microsoft.com/ieinternals/2011/05/14/stylesheet-limits-in-internet-explorer/)
Второе о чему нунжно помнить — мы не можем экстендить внутри медиа запроса тот селектор который находится с наружи этого медиа запроса
```
@media (min-width: 42em) {
    .otherselector {
        @extend %clearfix;
    }
}
```
К сожалению сгенерирует ошибку. И вот тут нам могут помочь миксины. Например такого плана
```scss
@mixin clearfix($extend: true) {
    @if $extend == true {
        @extend %clearfix;
    } @else {
        &:before,
        &:after {
            content: '';
            display: table;
        }
        &:after {
            clear: both;
        }
    }
}
%clearfix {
    @include clearfix($extend: false);
}
```
И пример использования
```scss
.someselector {
    @include clearfix;
}

@media (min-width: 42em) {
    .otherselector {
        @include clearfix($extend: false);
    }
}
```
Неплохая статься про extend http://csswizardry.com/2014/11/when-to-use-extend-when-to-use-a-mixin/

## 6. Автоматизировать вендорные префиксы

Еще онда проблема решение которой лучше не доверять Compass. Он все еще генерирует  
```css
-webkit-border-radius: 2px;
-moz-border-radius: 2px;
```
А если он еще и не первой свежести то и того хуже
```css
-webkit-border-radius: 2px;
-moz-border-radius: 2px;
-ms-border-radius: 2px;
-o-border-radius: 2px;
```
Для вендорных префиксов есть замечательная штука [Autoprefixer] (https://github.com/postcss/autoprefixer). Он раставляет только нужные префиксы и убирает не нужные (Ага можно скормить стили просле компасовских миксинов и он подчистит ненужное)


## Вместо выводов 
 
Для начала на компьютере долен стоять node и npm
Выполняем
```bash
npm install --global gulp-cli
```
В папке files есть два файла `package.json` и `gulpfile.js`. Их нужно отредактировать добавив свои названия проекта и темы. Закинуть в корень и выполнить для установки всех зависимостей
```bash
npm install
```
Теперь мы можем запускать таски:
```bash
gulp sass
```
компилирует файлы `\*.scss` в папке `scss` темы и складывает в папку `css`, прогоняя через autoprefixer
```bash
gulp js
```
собирает и минифицирует файлы `\*.js` в папке `js/src` темы и создает файл `js/main.js` - хорошо для всяких мелочей, чтоб не писать все в один файл
```bash
gulp js
```
собирает и минифицирует файлы `\*.js` в папке `js/src` темы и создает файл `js/main.js` - хорошо для всяких мелочей, чтоб не писать все в один файл
```bash
gulp clean
```
удаляет `var/cache`

И самый интересный
```bash
gulp watch
```
слушает изменения в scss файлах, в `js/src` и в phtml файлах темы и запускает такски автоматически (sass,js,clean соответсвенно)
Плюс перезапускает livereload сервер.


