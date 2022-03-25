let fileName = "fileSystemAccessApiSample.html";
 //=====================================
 //指定の年月を取得(指定無し=>現在)
 //=====================================
let params = (new URL(document.location)).searchParams;
let year = params.get('year');
let month = params.get('month');

if(year === null || month === null){
  let d = new Date();
  //固定月(sample用)
  d = new Date(2022,3 - 1);

  year = d.getFullYear();
  month = d.getMonth() + 1;
}

 //=====================================
 //前月または翌月に移動
 //=====================================
function changeMonth(val){
  let d = new Date(year, month - 1);
  if(val == -1){
    d.setMonth(d.getMonth() - 1);
  }
  if(val == 1){
    d.setMonth(d.getMonth() + 1);
  }
  let y = d.getFullYear();
  let m = d.getMonth() + 1
  window.location.href = './' + fileName + '?year=' + y + '&month' + '=' + m;
}

 //=====================================
 //当月の一覧作成
 //=====================================
//行数：tableObject.rows.length
//列数：tableObject.rows[0].cells.length
let tableObject = document.getElementById('nippo');

for (let i = 1; i < 32; i++) {
  var tableEle = tableObject;
  var tbody = document.createElement('tbody');
  tbody.id="tbody1";
  var tr = document.createElement('tr');
  var th = document.createElement('th');
  th.innerHTML = year + "/" + month + "/" + i;
  tr.appendChild(th);

  for (let j = 1; j < tableObject.rows[0].cells.length; j++) {
    var td = document.createElement('td');
    td.innerHTML = "<textarea></textarea>";
    tr.appendChild(td);
  }
  tr.classList.add('table_striped_grey');
  tbody.appendChild(tr);
  tableEle.appendChild(tbody);
}

 //=====================================
 //読み込んだファイルを反映（ファイルはjson形式にしとけばよかった・・・）
 //=====================================
function fileOutput(result){
  let saveDate = result[0].split('\t');
  saveDate = "";
  let lastRowNum;
  for(let i = 0; i < result.length; i++){
    let val = result[i].split('\t');
    try{
      let rowNum = document.getElementById(val[1]).cellIndex;
      for(let j = 0; j < 32; j++){
        if(tableObject.rows[j].cells[0].innerHTML == val[0]){
          if(saveDate == val[0]){
            if(rowNum == lastRowNum){
              tableObject.rows[j].cells[rowNum].children[0].value = tableObject.rows[j].cells[rowNum].children[0].value + "\r\n" + val[2];
            } else{
              tableObject.rows[j].cells[rowNum].children[0].value = val[2];
            }
          } else{
            saveDate = val[0];
            tableObject.rows[j].cells[rowNum].children[0].value = val[2];
          }
          break;
        }
      }
      lastRowNum = rowNum;
    }catch(error){
      console.log("error:" + error);
    }
  }
}
 //=====================================
 //ファイル保存関数
 //=====================================
function fileSave(){
  let saveValue = "";
  for(let j = 1; j < 32; j++){
    for(let rowNum = 1; rowNum < tableObject.rows[0].cells.length; rowNum++){
      try{
        //改行コードでsplit
        let textarea = tableObject.rows[j].cells[rowNum].children[0].value.split(/\r\n|\r|\n/);
        for(i = 0; i < textarea.length; i++){
          saveValue = saveValue + tableObject.rows[j].cells[0].innerHTML + "\t" + tableObject.rows[0].cells[rowNum].id + "\t" + textarea[i] + "\r\n";
          console.log(textarea[i]);
        }
      } catch(error){
      console.log("error:" + error);
      }
    }
  }
  document.getElementById('editor').value = saveValue;
}

 //=====================================
 //ファイルIO関数
 //=====================================
let fileHandle
// テキストファイルだけ開けるオプション
const pickerOpts = {
    types: [
        {
            description: 'Texts',
            accept: {
                'text/*': ['.txt', '.text']
            }
        }
    ],
    multiple: false,
}
document.getElementById('open').onclick = async () => {
    try {
        [ fileHandle ] = await window.showOpenFilePicker(pickerOpts)
        //const root = await navigator.storage.getDirectory('');
        //const fileHandle = await root.getFile('nakayama.txt',{create:true});
        if (fileHandle.kind !== 'file') return
        const fileData = await fileHandle.getFile()
        const content = await fileData.text()
        document.getElementById('editor').value = content
        //結果を格納
        result = content.split('\n');
        fileOutput(result);
    } catch (e) {
        // ファイル選択をキャンセルした時などにここに飛ぶ
        console.error(e)
    }
}

document.getElementById('save').onclick = async () => {
    if (fileHandle.kind !== 'file') return
    fileSave()
    const content = document.getElementById('editor').value
    const writableStream = await fileHandle.createWritable()
    await writableStream.write(content)
    await writableStream.close()
}
