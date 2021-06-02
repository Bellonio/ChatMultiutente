package com.bellone.chat;

import androidx.appcompat.app.AppCompatActivity;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.text.method.ScrollingMovementMethod;
import android.view.KeyEvent;
import android.view.View;
import android.view.inputmethod.InputMethodManager;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import com.google.android.material.floatingactionbutton.FloatingActionButton;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.Socket;

public class ChatActivity extends AppCompatActivity {

    private Context context = null;
    private TextView lblChat = null;
    private EditText txtMsg = null;
    private FloatingActionButton btnInvia = null;
    private Socket socket = null;
    private ThreadRicezione threadRicezione = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_chat);

        String username = getIntent().getExtras().getString("username");
        String awayMsg = getIntent().getExtras().getString("awayMsg");
        int timeout = getIntent().getExtras().getInt("timeout");
        String passw = getIntent().getExtras().getString("passw");

        context = this;

        lblChat = findViewById(R.id.lblChat_chat);
        txtMsg = findViewById(R.id.txtMsg_chat);
        btnInvia = findViewById(R.id.btnInvia_chat);

        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    socket = new Socket("192.168.1.103", 3000);

                    //dopo alla creazione del socket posso creare il thread per la ricezione
                    // (visto che il socket lo devo creare in un altro thread allora
                    //  non posso creare il thread di ricezione fuori da questo thread,
                    //  cioè riga 71)
                    threadRicezione = new ThreadRicezione();
                    threadRicezione.start();

                    inviaConfigurazione(username, awayMsg, timeout, passw);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }).start();
    }

    @Override
    protected void onResume() {
        super.onResume();

        lblChat.setMovementMethod(new ScrollingMovementMethod());

        btnInvia.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                clickSuBtnInvia();
            }
        });
        txtMsg.setOnKeyListener(new View.OnKeyListener() {
            @Override
            public boolean onKey(View v, int keyCode, KeyEvent event) {
                if(keyCode == KeyEvent.KEYCODE_ENTER){
                    clickSuBtnInvia();
                }
                return false;
            }
        });
    }

    @Override
    public void onBackPressed() { /* (non fa niente) */ }

    public void inviaConfigurazione(String username, String awayMsg, int timeout, String passw){
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    inviaAlServer(("#config#nickname:"+username));
                    //ho bisogno di aspettare un attimino prima di inviare il prossimo msg
                    // xke senno al server arriva un unico messaggio (ad esempio arriva
                    //"#config#nickname:Giulios#config#away_message:Adios" TUTTO INSIEME
                    Thread.sleep(80);

                    //se inserisce un username non valido tornerà al MainActivity dove potrà
                    // SOLO inserire l'username. Dopo di che invierà a questa activity il nuovo
                    // username e dei valori nulli per il resto (SONO GIÀ REGISTRATI SUL SERVER
                    // GLI ALTRI VALORI)
                    if(awayMsg != null) {
                        inviaAlServer(("#config#away_message:" + awayMsg));
                        Thread.sleep(80);

                        inviaAlServer(("#config#timeout:" + timeout));
                        Thread.sleep(80);

                        inviaAlServer(("#config#passw:" + passw));
                        Thread.sleep(80);
                    }
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }).start();
    }

    public void clickSuBtnInvia(){
        hideKeyboard(ChatActivity.this);
        if(socket != null) {
            if(txtMsg.length() > 0){
                String msg = txtMsg.getText().toString();
                txtMsg.setText("");

                new Thread(new Runnable() {
                    @Override
                    public void run() {
                        inviaAlServer(msg);

                        runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                lblChat.append(("(Tu): "+msg+"\n"));
                            }
                        });
                    }
                }).start();
            }
        }else{
            Toast.makeText(context, context.getString(R.string.erroreConn), Toast.LENGTH_SHORT).show();
        }
    }

    public void inviaAlServer(String msg){
        OutputStream outputStream = null;
        try {
            outputStream = socket.getOutputStream();
            outputStream.write(msg.getBytes());
            outputStream.flush();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void hideKeyboard(Activity activity) {
        //https://stackoverflow.com/questions/1109022/how-do-you-close-hide-the-android-soft-keyboard-programmatically

        InputMethodManager imm = (InputMethodManager) activity.getSystemService(Activity.INPUT_METHOD_SERVICE);
        //prende la view che ha il focus dell'utente, banalmente se ci fossero più edittext prende quella su cui l'utente ha cliccato
        View view = activity.getCurrentFocus();
        //If no view currently has focus, create a new one, just so we can grab a window token from it
        if (view != null) {
            imm.hideSoftInputFromWindow(view.getWindowToken(), 0);
        }
    }

    public class ThreadRicezione extends Thread {
        @Override
        public void run() {
            super.run();

            //solo il thread principale può modificare le UI. Come possiamo farlo
            // dal thread secondario ?
            // 1-asynctask ma è DEPRECATO
            // 2-runOnUiThread() ma è PESANTE

            try {
                BufferedReader br = new BufferedReader(new InputStreamReader(socket.getInputStream()));
                while(true) {
                    String msg = br.readLine();

                    if(msg != null && msg.length() > 0){

                        if(msg.startsWith("Error")){
                            Intent intent = new Intent(context, MainActivity.class);
                            intent.putExtra("error", msg);
                            startActivity(intent);
                        }else{
                            runOnUiThread(new Runnable() {
                                @Override
                                public void run() {
                                    lblChat.append(msg+"\n");
                                }
                            });
                        }
                    }
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}