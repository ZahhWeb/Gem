import React from "react"
import bgMusic from "../assets/bg.mp3"
import './index.css'
const lines=[
 [0,1,2],[3,4,5],[6,7,8],
 [0,3,6],[1,4,7],[2,5,8],
 [0,4,8],[2,4,6]
]

const aiMotivation=[
 "Bodo sekali kamu!",
 "Belajar lagi dek!",
 "Tolol gini aja gak bisa!",
 "Masa sama gue kalah!",
 "Iziiiiiiii Wellllllll!",
 "ikan hiyu makan sendal wellll",
 "Bapa Kau botak",
 "Udah gak bisa mah diem",
 "Kesian Kali kau",
 "Info godin",
 "Si Hamzah pergi ke pasar Ilov yu"
]

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

 const loadScore=()=>JSON.parse(localStorage.getItem("ttt_score_vite")||"{\"X\":0,\"O\":0,\"AI\":0}")
 const saveScore=(s)=>localStorage.setItem("ttt_score_vite",JSON.stringify(s))

 const[board,setBoard]=React.useState(Array(9).fill(null))
 const[player,setPlayer]=React.useState("X")
 const[end,setEnd]=React.useState(false)
 const[mode,setMode]=React.useState(null)
 const[winLine,setWinLine]=React.useState([])
 const[score,setScore]=React.useState(loadScore())
 const[popup,setPopup]=React.useState("")
 const[lock,setLock]=React.useState(false)
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

 function click(i){
  if(!mode || board[i] || end || lock) return

  let b=[...board]
  b[i]=player
  let r=cek(b)

  if(r){
    setBoard(b)
    setWinLine(r.line)
    setEnd(true)
    tambahScore(player)
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
    }else if(!b.includes(null)){
      setBoard([...b])
      setEnd(true)
      setPopup("Seri")
    }else{
      setBoard([...b])
    }
    setLock(false)
  },400)
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
 <div style={{marginTop:40,textAlign:"center",color:"white",fontFamily:"Segoe UI",background:"#0f172a",minHeight:"100vh",paddingTop:20}}>

 <h1>Tic Tac Toe</h1>
 <audio ref={audioRef} src={bgMusic} loop />

 <div>
  <button onClick={()=>pilih("ai")}>Main vs Ai CyberZah</button>
  <button onClick={()=>pilih("friend")}>Main vs Teman</button>
 </div>

 <h3>
  {mode==="ai" && "Mode: Ai CyberZah"}
  {mode==="friend" && "Mode: Teman"}
  {!mode && "Pilih Mode"}
 </h3>

 {mode==="friend" && <h3>Giliran: {player}</h3>}
 {mode==="ai" && <h3>Giliran: Kamu (X)</h3>}

 <div style={{display:"grid",gridTemplateColumns:"repeat(3,100px)",gap:10,justifyContent:"center",marginTop:20}}>
 {board.map((v,i)=>(
  <button key={i} onClick={()=>click(i)}
   style={{
    width:100,
    height:100,
    fontSize:34,
    borderRadius:8,
    border:"none",
    background:winLine.includes(i)?"#16a34a":"#1f2937",
    color:"white"
   }}
  >{v}</button>
 ))}
 </div>

 <div style={{marginTop:20}}>
  <button onClick={resetBoard}>Restart</button>
  <button onClick={clearScore}>Clear Skor</button>
 </div>

 {mode==="friend" && (
  <div>
   <div>Skor X : {score.X}</div>
   <div>Skor O : {score.O}</div>
  </div>
 )}

 {mode==="ai" && (
  <div>
   <div>Kamu : {score.X}</div>
   <div>Ai CyberZah : {score.AI}</div>
  </div>
 )}

 {popup && (
  <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center"}}>
   <div style={{background:"#111827",padding:20,borderRadius:10}}>
    <h3>{popup}</h3>
    <button onClick={()=>setPopup("")}>Tutup</button>
   </div>
  </div>
 )}

 </div>
 )
}
