import React from "react"
import bgMusic from "../assets/bg.mp3"
import img from "../assets/1765104707992~2.jpg"
import './index.css'
import { db } from "./firebase"
import { ref, push, onValue } from "firebase/database"

const lines=[
 [0,1,2],[3,4,5],[6,7,8],
 [0,3,6],[1,4,7],[2,5,8],
 [0,4,8],[2,4,6]
]

const aiMotivation = [
 "Langkahmu barusan benar-benar tidak masuk akal!",
 "Kamu seperti sengaja memilih langkah terburuk!",
 "Strategimu kosong total!",
 "Aku bahkan tidak perlu berpikir untuk mengalahkanmu!",
 "Permainanmu berantakan dari awal!",
 "Setiap giliranmu justru menguntungkanku!",
 "Kamu membuat kesalahan dengan sangat konsisten!",
 "Main seperti ini mau menang dari siapa?",
 "Logika permainanmu benar-benar kacau!",
 "Langkahmu seperti dipilih tanpa otak strategi!",
 "Aku sampai heran kamu bisa salah terus!",
 "Ini bukan duel, ini latihan gratis buatku!",
 "Kamu membuka semua peluang untukku!",
 "Cara mainmu terlalu mudah dibaca!",
 "Kamu mengalahkan dirimu sendiri!",
 "Setiap keputusanmu mempercepat kekalahan!",
 "Aku tidak perlu jebakan, kamu sudah menjebak diri sendiri!",
 "Strategimu runtuh sebelum permainan selesai!",
 "Kamu benar-benar membantu aku menang!",
 "Kalau terus begini, permainan ini jadi membosankan!",
 "ikan hiyu beli somay",
 "ikan Hiyu makan tomat welllll",
 "Si Zibong pergi ke pasar wellll",
 "Kalau mau menang coba sebut ini, Hamzah kasep"
];

function cek(board){
 for(let l of lines){
  const[a,b,c]=l
  if(board[a] && board[a]===board[b] && board[a]===board[c]){
   return {p:board[a],line:l}
  }
 }
 return null
}

function minimax(board,depth,isAI){
 let r=cek(board)

 if(r?.p==="O") return 10-depth
 if(r?.p==="X") return depth-10
 if(!board.includes(null)) return 0

 if(isAI){
  let best=-999
  for(let i=0;i<9;i++){
   if(board[i]===null){
    board[i]="O"
    let s=minimax(board,depth+1,false)
    board[i]=null
    best=Math.max(best,s)
   }
  }
  return best
 }else{
  let best=999
  for(let i=0;i<9;i++){
   if(board[i]===null){
    board[i]="X"
    let s=minimax(board,depth+1,true)
    board[i]=null
    best=Math.min(best,s)
   }
  }
  return best
 }
}

function aiMove(board){
 let kosong=board.map((v,i)=>v===null?i:null).filter(v=>v!==null)

 if(Math.random()<0.2){
  return kosong[Math.floor(Math.random()*kosong.length)]
 }

 let best=-999
 let move=kosong[0]

 for(let i=0;i<9;i++){
  if(board[i]===null){
   board[i]="O"
   let s=minimax(board,0,false)
   board[i]=null
   if(s>best){
    best=s
    move=i
   }
  }
 }
 return move
}

export default function App(){

 const loadScore=()=>JSON.parse(localStorage.getItem("ttt_score")||"{\"X\":0,\"O\":0,\"AI\":0}")
 const saveScore=(s)=>localStorage.setItem("ttt_score",JSON.stringify(s))

 const[board,setBoard]=React.useState(Array(9).fill(null))
 const[player,setPlayer]=React.useState("X")
 const[end,setEnd]=React.useState(false)
 const[mode,setMode]=React.useState(null)
 const[winLine,setWinLine]=React.useState([])
 const[score,setScore]=React.useState(loadScore())
 const[popup,setPopup]=React.useState("")
 const[lock,setLock]=React.useState(false)

 const[playerName,setPlayerName]=React.useState("")
 const[inputName,setInputName]=React.useState("")
 const[leader,setLeader]=React.useState([])

 const audioRef=React.useRef(null)

 function resetBoard(){
  setBoard(Array(9).fill(null))
  setPlayer("X")
  setEnd(false)
  setWinLine([])
  setLock(false)
 }

 function clearScore(){
  const s={X:0,O:0,AI:0}
  setScore(s)
  saveScore(s)
 }

 function tambahScore(p){
  let s={...score}

  if(mode==="friend"){
   if(p==="X") s.X++
   if(p==="O") s.O++
  }else{
   if(p==="X") s.X++
   if(p==="O") s.AI++
  }

  setScore(s)
  saveScore(s)
}

 function saveLeader(){
  if(!playerName) return

  push(ref(db,"leaderboard"),{
   name:playerName,
   score:1,
   time:Date.now()
  })
 }

 React.useEffect(()=>{

  const leaderboardRef = ref(db,"leaderboard")

  onValue(leaderboardRef,(snapshot)=>{
   const data = snapshot.val() || {}

   let arr = Object.values(data)

   let map={}

   arr.forEach(v=>{
    if(!map[v.name]) map[v.name]=0
    map[v.name]+=v.score
   })

   let result = Object.keys(map).map(n=>({
    name:n,
    score:map[n]
   }))

   result.sort((a,b)=>b.score-a.score)

   setLeader(result.slice(0,10))
  })

 },[])

 function click(i){

  if(!playerName){
   setPopup("Masukkan nama dulu")
   return
  }

  if(!mode || board[i] || end || lock) return

  let b=[...board]
  b[i]=player

  let r=cek(b)

  if(r){
   setBoard(b)
   setWinLine(r.line)
   setEnd(true)
   tambahScore(player)

   if(mode==="ai" && player==="X"){
    saveLeader()
   }

   if(mode==="ai" && r.p==="O"){
    const msg=aiMotivation[Math.floor(Math.random()*aiMotivation.length)]
    setPopup("Ai CyberZah Menang! "+msg)
   }else{
    setPopup("Pemain "+player+" Menang")
   }
   return
  }

  if(!b.includes(null)){
   setBoard(b)
   setEnd(true)
   setPopup("Seri")
   return
  }

  if(mode==="friend"){
   setBoard(b)
   setPlayer(player==="X"?"O":"X")
   return
  }

  setBoard(b)
  setLock(true)

  setTimeout(()=>{
   let m=aiMove(b)
   b[m]="O"

   let r2=cek(b)

   if(r2){
    setBoard([...b])
    setWinLine(r2.line)
    setEnd(true)
    tambahScore("O")
    const msg=aiMotivation[Math.floor(Math.random()*aiMotivation.length)]
    setPopup("Ai CyberZah Menang! "+msg)
   }
   else if(!b.includes(null)){
    setBoard([...b])
    setEnd(true)
    setPopup("Seri")
   }
   else{
    setBoard([...b])
   }

   setLock(false)

  },500)
 }

 function pilih(m){
  setMode(m)
  resetBoard()

  if(audioRef.current){
   audioRef.current.volume=0.4
   audioRef.current.play().catch(()=>{})
  }
 }

 return(
 <div className="app">
 <div className="imggg">
 <img src={img} />
 </div>
 <h1>Tic Tac Toe</h1>

 <audio ref={audioRef} src={bgMusic} loop />

 <div className="name-box">
  <input
   placeholder="Masukkan Nama"
   value={inputName}
   onChange={e=>setInputName(e.target.value)}
  />
  <button onClick={()=>setPlayerName(inputName)}>
   Simpan
  </button>
 </div>

 <div>
  <button onClick={()=>pilih("ai")}>
   Main vs Ai CyberZah
  </button>

  <button onClick={()=>pilih("friend")}>
   Main vs Teman
  </button>
 </div>

 <div className="board">
 {board.map((v,i)=>(
  <button
   key={i}
   onClick={()=>click(i)}
   className={winLine.includes(i)?"cell win":"cell"}
  >
   {v}
  </button>
 ))}
 </div>

 <div className="control">
  <button onClick={resetBoard}>Restart</button>
  <button onClick={clearScore}>Clear Skor</button>
 </div>

 {mode==="ai" && (
 <div className="score">
  Kamu : {score.X} | Ai : {score.AI}
 </div>
 )}

 {mode==="friend" && (
 <div className="score">
  X : {score.X} | O : {score.O}
 </div>
 )}

 {popup && (
 <div className="popup-bg">
  <div className="popup">
   <h3>{popup}</h3>
   <button onClick={()=>setPopup("")}>Tutup</button>
  </div>
 </div>
 )}

 <div className="leaderboard">
 <h3>Top Player Global</h3>

 {leader.length===0 && (
 <div className="leader-empty">
 Belum ada skor
 </div>
 )}

 {leader.map((v,i)=>(
  <div key={i} className="leader-row">
   <span>{i+1}. {v.name}</span>
   <span>{v.score}</span>
  </div>
 ))}

 </div>

 </div>
 )
}
