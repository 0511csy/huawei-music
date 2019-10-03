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
    this.lyricsArr=[]
    this.lyricIndex= -1
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
            this.loadSong()
       })
    }
    bind(){
        let self =this
        this.$('.btn-play-pause').onclick = function() {
            
        
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
            self.currentIndex = (self.songList.length+self.currentIndex-1) % self.songList.length
            // self.audio.src=this.songList[this.currentIndex].url
            self.playSong()
            self.loadSong()
        }
        this.$('.btn-next').onclick= function(){
            self.currentIndex = (self.songList.length+self.currentIndex+1) % self.songList.length
            // this.audio.src=this.songList[this.currentIndex].url
            self.playSong()
            self.loadSong()
        }
        this.audio.ontimeupdate = function(){
            self.locateLyric()
            self.setProgressBar()
        }
        this.$('.bar').onclick = function(e){
            let bar = self.$('.bar')
            let move = e.clientX - bar.offsetLeft
            let percent = move/bar.offsetWidth
            console.log(percent)
            // self.audio.currentTime = self.audio.duration * percent
        }
        let swiper = new Swiper(this.$('.panels'))
        swiper.on('swipeLeft', function () {
            
            this.classList.remove("panel1")
            this.classList.add("panel2")
            self.$('.balls span').classList.remove('current')
            self.$('.balls span:last-child').classList.add('current')
            console.log('left')
        })
        swiper.on('swipeRight', function () {
            this.classList.remove("panel2")
            this.classList.add("panel1")
            self.$('.balls span:last-child').classList.remove('current')
            self.$('.balls span:first-child').classList.add('current')
            console.log('right')
        })
    }
  
  
    loadSong(){
        let songObj = this.songList[this.currentIndex]
        this.$('.header h1').innerText = songObj.title
        this.$('.header p').innerText = songObj.author + '-' + songObj.albumn
        this.audio.src = songObj.url
        this.audio.onloadedmetadata = ()=> this.$('.time-end').innerText = this.formateTime(this.audio.duration)
        this.loadLyric()
    }
    playSong(){
        this.audio.oncanplaythrough = ()=> this.audio.play()
        this.audio.loop = true
    }
    loadLyric(){
        fetch(this.songList[this.currentIndex].lyric)
        .then(res=>res.json())
        .then(data=>{
            data=>data.lrc.lyric
            console.log(data.lrc.lyric)
            this.setLyrics(data.lrc.lyric)
            window.lyrics= data.lrc.lyrc
            })
    }
    locateLyric(){
        let currentTime = this.audio.currentTime *1000
        let nextTime = this.lyricsArr[this.lyricIndex+1][0]
        if(currentTime>nextTime &&this.lyricIndex <this.lyricsArr.length-1){
            this.lyricIndex++
            let node = this.$('[data-time="'+this.lyricsArr[this.lyricIndex][0]+'"]')
            if(node) this.setLyricsToCenter(node)
            this.$$('.panel-effect .lyric p')[0].innerText = this.lyricsArr[this.lyricIndex]?this.lyricsArr[this.lyricIndex][1]:''
            this.$$('.panel-effect .lyric p')[1].innerText = this.lyricsArr[this.lyricIndex+1]?this.lyricsArr[this.lyricIndex+1][1]:''
        }else if(this.lyricIndex >this.lyricsArr.length-1){
            this.onPlayEnd()
        }
    }
    onPlayEnd(){
        this.currentIndex = (this.songList.length+this.currentIndex+1) % this.songList.length
        this.audio.src=this.songList[this.currentIndex].url
        this.playSong()
        this.loadSong()
    }
    setLyrics(lyrics){
        this.lyricIndex = 0
        let fragment = document.createDocumentFragment()
        let lyricsArr = []
        this.lyricsArr = lyricsArr
        lyrics.split(/\n/)
        .filter(str=>str.match(/\[.+?\]/g,''))
        .forEach(line=>{
            let str = line.replace(/\[.+?\]/g,'')
            line.match(/\[.+?\]/g,'').forEach(t=>{
                t =t.replace(/[\[\]]/g,'')
                let milliseconds = parseInt(t.slice(0,2))*60*1000 + parseInt(t.slice(3,5))*1000 + parseInt(t.slice(6))
                lyricsArr.push([milliseconds,str])
            })
        })
        lyricsArr.filter(line => line[1].trim()!== '').sort((v1,v2) =>{
            if(v1[0] > v2[0]){
                return 1
            }else{
                return -1
            }
        }).forEach(line=>{
            let node = document.createElement('p')
            node.setAttribute('data-time',line[0])
            node.innerText = line[1]
            fragment.appendChild(node)
        })
        this.$('.panel-lyrics .container').innerHTML = ''
        this.$('.panel-lyrics .container').appendChild(fragment)
    }
    setLyricsToCenter(node){
        let translateY = node.offsetTop - this.$('.panel-lyrics').offsetHeight/2
        translateY > 0? translateY:0
        this.$('.panel-lyrics .container').style.transform = `translateY(-${translateY}px)`
        this.$$('.panel-lyrics p').forEach(node=>node.classList.remove('current'))
        node.classList.add('current')
    }
    setProgressBar(){
        let percent = (this.audio.currentTime*100/this.audio.duration) + '%'
        this.$('.bar .progress').style.width = percent
        this.$('.time-start').innerText = this.formateTime(this.audio.currentTime)
    }

    formateTime(secondesTatal){
        let minutes = parseInt(secondesTatal/60)
        minutes = minutes >= 10?''+minutes:'0'+minutes
        let seconds = parseInt(secondesTatal%60)
        seconds = seconds >= 10?''+seconds:'0'+seconds
        return minutes+':'+seconds
    }
}
   
    

new Player('#player')
