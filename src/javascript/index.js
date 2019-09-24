import './icons.js'
import Swiper from './swiper.js'





class Player{
    constructor(node) {
    this.root = typeof node === 'string' ? document.querySelector(node) : node
    this.songList = []
    this.currentIndex = 0
    this.audio = new Audio()
    this.$=selector =>this.root.querySelector(selector)
    this.$$=selector=>this.root.querySelectorAll(selector)
    this.start()
    this.bind()
    //https://jirengu.github.io/data-mock/huawei-music/music-list.json

  }
    start(){
       fetch('https://jirengu.github.io/data-mock/huawei-music/music-list.json')
       .then(res=> 
        res.json()
       )
       .then(data=>{
           console.log(data)
           this.songList=data
           this.audio.src=this.songList[this.currentIndex].url
       })
    }
    bind(){
        let self =this
        this.$('.btn-play-pause').onclick = function() {
            
            // if(this.classList.contains('pause')) {
            //     self.audio.play()
            //     this.classList.remove('pause')
            //     this.classList.add('playing')
            //     this.querySelector('use').setAttribut('xlink-href','#icon-play')
            // }else if(this.classList.contains('playing')){
            //     self.audio.pause()
            //     this.classList.remove('playing')
            //     this.classList.add('pause')
            //     this.querySelector('use').setAttribut('xlink-href','#icon-pause')
            // }
            if(this.classList.contains('playing')) {
                self.audio.pause()
                this.classList.remove('playing')
                this.classList.add('pause')
                this.querySelector('use').setAttribute('xlink:href','#icon-play')
            }else if(this.classList.contains('pause')){
                self.audio.play()
                this.classList.remove('pause')
                this.classList.add('playing')
                this.querySelector('use').setAttribute('xlink:href','#icon-pause')
            }
        }
        this.$('.btn-pre').onclick= function(){
            self.playPrevSong()
        }
        this.$('.btn-next').onclick= function(){
            self.playNextSong()
        }
        let swiper = new Swiper(this.$('.panels'))
        swiper.on('swipeLeft', function () {
            
            this.classList.remove("panel1")
            this.classList.add("panel2")
            console.log('left')
        })
        swiper.on('swipeRight', function () {
            this.classList.remove("panel2")
            this.classList.add("panel1")
            console.log('right')
        })
    }
    playPrevSong() {
        this.currentIndex = (this.songList.length+this.currentIndex-1) % this.songList.length
        this.audio.src=this.songList[this.currentIndex].url
        this.audio.oncanplaythrough=()=>this.audio.play()
        }
    playNextSong() {
        this.currentIndex = (this.songList.length+this.currentIndex+1) % this.songList.length
        this.audio.src=this.songList[this.currentIndex].url
        this.audio.oncanplaythrough=()=>this.audio.play()
    }
}
   
    

new Player('#player')
