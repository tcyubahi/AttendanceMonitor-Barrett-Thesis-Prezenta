package prezenta2018;

/*
 * Author: Tresor Cyubahiro © 2018
 * Description: A java tool to augment the ID Reader Device to process and send realtime updates to active sessions. 
 * Barrett Honors College Thesis Project - Iteration 2
 */

import java.awt.CardLayout;
import java.awt.EventQueue;
import java.awt.Font;
import java.awt.Toolkit;
import java.awt.datatransfer.Clipboard;
import java.awt.datatransfer.StringSelection;

import javax.swing.JFrame;
import javax.swing.JButton;
import java.awt.event.ActionListener;
import java.awt.event.WindowAdapter;
import java.awt.event.WindowEvent;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.math.BigInteger;
import java.text.SimpleDateFormat;
import java.util.List;
import java.awt.event.ActionEvent;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JTextArea;
import javax.swing.ScrollPaneConstants;
import javax.swing.SwingWorker;
import javax.swing.border.EmptyBorder;
import javax.swing.text.DefaultCaret;
import javax.swing.ImageIcon;
import java.util.*;
import javax.swing.SwingConstants;
import org.json.*;

import javax.swing.JScrollPane;
import javax.swing.JTextField;
import javax.swing.JSeparator;
import javax.swing.JFileChooser;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.ResultSet;
import javax.swing.JCheckBox;

import jssc.*;

public class PrezentaJavaTool extends JFrame {

	private JPanel contentPane;
    public static JButton btnScan = new JButton("Connect");
    public static JTextArea textArea = new JTextArea();
    public static JCheckBox chckbxStudentRegistration = new JCheckBox("Student Registration");
	
    public static JSONObject allData = new JSONObject();
    public static JSONArray readIDs = new JSONArray();
    
    public static boolean sessionStarted = false;
    public static int attendeeCount = 0;
    
    public static String dateFormat = "MM-dd-yyyy";
    public static String timeFormat = "HH:mm:ss";
    public static String timeFormatFile = "HH-mm-ss";
    public static SimpleDateFormat dateFormatter = new SimpleDateFormat(dateFormat);
    public static SimpleDateFormat timeFormatter = new SimpleDateFormat(timeFormat);
    public static SimpleDateFormat timeFormatterFile = new SimpleDateFormat(timeFormatFile);
    public static Timer timer = new Timer();
    public static int time = 0;
    
    public String devicePort = "";
    public int checkAscii = 10003;
    public String checkMark = Character.toString((char)checkAscii);
    
    public static FileReader devFile;  
    public static SerialPort serialPort;
    private JTextField locationOnDisk;
    public static JTextField txtCurrentId;
    private JTextField saveFileName;
    
    public static JFileChooser folderPicker;
    public static BufferedReader reader;
    
    public static boolean logSession = true;
    
    public static Connection conn = null;
    public static Statement stmt = null;  
    public static ResultSet rs = null;
    public static ResultSet rs1 = null;
    
    public static String activeSession = null, activeOwner = null, activeStartTime = null, activeDate = null, activeEndTime = null;

	/**
	 * Main method.
	 */
	public static void main(String[] args) {
		EventQueue.invokeLater(new Runnable() {
			public void run() {
				try {
					PrezentaJavaTool frame = new PrezentaJavaTool();
					frame.setVisible(true);
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		});
	}

	/**
	 * Create the frame and populate it with components,
	 * attach action and event listeners to buttons and other event invoking components
	 */
	public PrezentaJavaTool() {
        
	    DefaultCaret caret = (DefaultCaret)textArea.getCaret();
	    caret.setUpdatePolicy(DefaultCaret.ALWAYS_UPDATE);
		Date today = new Date();
        
        allData.put("Date", dateFormatter.format(today));
        allData.put("Time", timeFormatter.format(today));
        setTitle("Prezenta ID Reader Java Tool - "+dateFormatter.format(today));
		setDefaultCloseOperation(JFrame.DO_NOTHING_ON_CLOSE);
        WindowAdapter adapter = new WindowAdapter() {
            @Override
            public void windowClosing(WindowEvent we) {

                String closeButtons[] = {"Yes", "No"};
                int promptRes = JOptionPane.showOptionDialog(null, "Are you sure?", "Prezenta ID Reader Java Tool", JOptionPane.DEFAULT_OPTION, JOptionPane.WARNING_MESSAGE, null, closeButtons, closeButtons[1]);
                
                if(promptRes == JOptionPane.YES_OPTION) {
                    System.exit(0);
                } 
            }
            
            public void windowOpened(WindowEvent e) {
            	scan();
            }
        };
        
        addWindowListener(adapter);
		setBounds(100, 100, 835, 615);
		contentPane = new JPanel();
		contentPane.setBorder(new EmptyBorder(5, 5, 5, 5));
		setContentPane(contentPane);
		contentPane.setLayout(new CardLayout(0, 0));
		
		JPanel sessionPanel = new JPanel();
		JPanel mainPanel = new JPanel();
		
		contentPane.add(sessionPanel, "name_3619056803028");
		sessionPanel.setLayout(null);
		
		JLabel lblNewLabel_3 = new JLabel("");
		lblNewLabel_3.setHorizontalAlignment(SwingConstants.CENTER);
		lblNewLabel_3.setIcon(new ImageIcon(PrezentaJavaTool.class.getResource("/prezenta2018/Prezenta-Logo.png")));
		lblNewLabel_3.setBounds(6, 6, 72, 95);
		sessionPanel.add(lblNewLabel_3);
		
		JLabel lblSession = new JLabel("Save Session Data ");
		lblSession.setFont(new Font("Serif", Font.PLAIN, 24));
		lblSession.setHorizontalAlignment(SwingConstants.CENTER);
		lblSession.setBounds(601, 6, 198, 37);
		sessionPanel.add(lblSession);
		
		JButton btnComplete = new JButton("Save");
		btnComplete.setBounds(607, 504, 198, 48);
		btnComplete.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
            	boolean flag = false;
            	
            	String file = locationOnDisk.getText()+"/"+saveFileName.getText();
            	File dataFile = new File(file);
            	
            	try {
					flag = dataFile.createNewFile();
					writeToFile(file);
				} catch (IOException e1) {
					e1.printStackTrace();
				}
            }
        });
		sessionPanel.add(btnComplete);
		
		JSeparator separator_2 = new JSeparator();
		separator_2.setBounds(6, 480, 793, 12);
		sessionPanel.add(separator_2);
		
		contentPane.remove(sessionPanel);
		
		locationOnDisk = new JTextField();
		locationOnDisk.setBounds(119, 258, 428, 48);
		locationOnDisk.setFont(new Font("Serif", Font.PLAIN, 28));
		sessionPanel.add(locationOnDisk);
		locationOnDisk.setColumns(10);
		
		JButton btnBrowse = new JButton("Browse");
		btnBrowse.setBounds(559, 259, 117, 48);
		btnBrowse.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                folderPicker = new JFileChooser();
                folderPicker.setCurrentDirectory(new java.io.File("."));
                folderPicker.setDialogTitle("Choose Folder");
                folderPicker.setFileSelectionMode(JFileChooser.DIRECTORIES_ONLY);
                folderPicker.setAcceptAllFileFilterUsed(false);
                
                if(folderPicker.showOpenDialog(btnBrowse) == JFileChooser.APPROVE_OPTION) {
                	System.out.println(folderPicker.getSelectedFile());
                	locationOnDisk.setText(folderPicker.getSelectedFile()+"");
                } else {
                	System.out.println("No Selection");
                }
            }
        });
		sessionPanel.add(btnBrowse);
		
		JLabel lblNewLabel_4 = new JLabel("Location on Disk");
		lblNewLabel_4.setBounds(119, 230, 131, 16);
		sessionPanel.add(lblNewLabel_4);
		
		JButton btnBack = new JButton("Back");
		btnBack.setBounds(6, 504, 198, 48);
		btnBack.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                contentPane.remove(sessionPanel);
                contentPane.add(mainPanel);
                contentPane.validate();
            }
        });
		sessionPanel.add(btnBack);
		
		saveFileName = new JTextField();
		saveFileName.setColumns(10);
		saveFileName.setBounds(119, 159, 428, 48);
		saveFileName.setFont(new Font("Serif", Font.PLAIN, 28));
		sessionPanel.add(saveFileName);
		
		JLabel lblNameTheNew = new JLabel("Name the new File");
		lblNameTheNew.setBounds(119, 131, 131, 16);
		sessionPanel.add(lblNameTheNew);
		
		JLabel lblNewLabel_1 = new JLabel("Clicking Save will generate a JSON file to be uploaded to the Web application");
		lblNewLabel_1.setBounds(318, 452, 481, 16);
		sessionPanel.add(lblNewLabel_1);
	
		contentPane.add(mainPanel, "name_357471258683");
		mainPanel.setLayout(null);
		
		JLabel lblNewLabel = new JLabel("");
		lblNewLabel.setHorizontalAlignment(SwingConstants.CENTER);
		lblNewLabel.setIcon(new ImageIcon(PrezentaJavaTool.class.getResource("/prezenta2018/Prezenta-Logo.png")));
		lblNewLabel.setBounds(6, 6, 72, 96);
		mainPanel.add(lblNewLabel);
		
		JScrollPane scrollPane = new JScrollPane();
		scrollPane.setBounds(6, 247, 793, 215);
        scrollPane.setVerticalScrollBarPolicy(ScrollPaneConstants.VERTICAL_SCROLLBAR_ALWAYS);
		mainPanel.add(scrollPane);
		
		scrollPane.setViewportView(textArea);
		
//		btnScan.setBounds(173, 497, 170, 54);
//        btnScan.addActionListener(new ActionListener() {
//            public void actionPerformed(ActionEvent e) {
//            	scan();
//
//            }
//        });
//		mainPanel.add(btnScan);
//		
		txtCurrentId = new JTextField();
		txtCurrentId.setText("XXX-XXX-XXXX");
		txtCurrentId.setBounds(173, 173, 269, 34);
		txtCurrentId.setFont(new Font("Serif", Font.PLAIN, 32));
		txtCurrentId.setEnabled(false);
		mainPanel.add(txtCurrentId);
		txtCurrentId.setColumns(10);
		
		JLabel lblActiveCard = new JLabel("Active Card ID Number");
		lblActiveCard.setBounds(186, 145, 158, 16);
		mainPanel.add(lblActiveCard);
		
		JSeparator separator = new JSeparator();
		separator.setBounds(6, 474, 793, 12);
		mainPanel.add(separator);
		
		JButton btnCopy = new JButton("Copy to Clipboard");
		btnCopy.setBounds(454, 168, 185, 45);
		btnCopy.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                StringSelection currentId = new StringSelection(txtCurrentId.getText());
                Clipboard clipboard = Toolkit.getDefaultToolkit().getSystemClipboard();
                clipboard.setContents(currentId, null);
            }
        });
		mainPanel.add(btnCopy);
		
		JSeparator separator_3 = new JSeparator();
		separator_3.setBounds(6, 223, 793, 12);
		mainPanel.add(separator_3);
		
		chckbxStudentRegistration.setBounds(6, 509, 185, 23);
		mainPanel.add(chckbxStudentRegistration);
		
//		JLabel lblNewLabel_2 = new JLabel("Click \"Connect\" to retry connection if failed on startup");
//		lblNewLabel_2.setBounds(121, 561, 269, 16);
//		lblNewLabel_2.setFont(new Font("Lucida Grande 10", Font.PLAIN, 10));
//		mainPanel.add(lblNewLabel_2);
	}
	
	/*
     * Method: Scan
     * Param: none
     * Return: void
     * Description: Method to scan device availability, database connection, and active session from the web portal.
     */
    public void scan () {
    	
        String osType = System.getProperty("os.name");
        System.out.println(osType);
        if (osType.contains("Mac")) {
	    		
	    		//Threads for device connection, DB connection, and Active Class in web portal 
	    		DeviceConnection deviceConn = new DeviceConnection();
	    		DatabaseConnection databaseConn = new DatabaseConnection();
	    		ActiveSessionConnection activeSessionConn = new ActiveSessionConnection(deviceConn, databaseConn);
	    		
	    		Thread devConn = new Thread(deviceConn);
	    		Thread dbConn = new Thread(databaseConn);
	    		Thread activeConn = new Thread(activeSessionConn);
	    		
	    		devConn.start();
	    		dbConn.start();
	    		activeConn.start();
				
	    		//System.out.println(deviceConn.connectToDevice());
	    		//System.out.println(databaseConn.connectToDB());				
		            
	    	
        } else if(osType.contains("Windows")) {
        	pickPort();
        }
    }
    
    
    /*
     * Method: connectToDatabse
     * Return: boolean
     * Params: none
     * Description: method to connect to the USART interface from the device to computer
     */
    public boolean connectToDevice () throws IOException, InterruptedException {
    	
        boolean foundDevice = false;
        
        textArea.append("Getting things ready...\n\n");
        String homeDir = System.getProperty("user.home");

        textArea.append("\n");
        
        ProcessBuilder builder = new ProcessBuilder();
        
        builder.command("sh", "-c", "ls /dev/cu.*", "/dev/cu.*");
        builder.directory(new File(System.getProperty("user.home")));
               
        Process proc = builder.start();
        
        reader =  new BufferedReader(new InputStreamReader(proc.getInputStream()));

        String line = "";
        
        while((line = reader.readLine()) != null) {
           System.out.println(line);
           if (line.contains("cu.usbserial")) {
               devicePort = line;
               foundDevice = true;
               textArea.append(checkMark+"Found Device at "+line+"\n\n");
           }
        }
        int exitCode = proc.waitFor();
        
        if (!foundDevice) {
            textArea.append("No Device Found. Please make sure device is connected.\n\n");
        } 
        
    	return foundDevice;
    }
    
    /*
     * Method: pickPort
     * Return: void
     * Params: none
     * Description: method for Windows OS users to allow them to pick port for connected device
     */
    private void pickPort() {
    	EventQueue.invokeLater(new Runnable() {
    		@Override
    		public void run() {
            	Object[] possibilities = SerialPortList.getPortNames();
            	JFrame frame = new JFrame("Choose Device Port"); 
            	String port = (String)JOptionPane.showInputDialog(
            	                    frame,
            	                    "Make sure you pick the right port",
            	                    "Choose Device Port",
            	                    JOptionPane.PLAIN_MESSAGE,
            	                    null,
            	                    possibilities,
            	                    null);
            	if(port.contains("COM")) {
            		devicePort = port;
                    textArea.append(checkMark+"Device is connected on Port: "+port+"\n\n");
                    
    	    		//Threads for device connection, DB connection, and Active Class in web portal 
    	    		DatabaseConnection databaseConn = new DatabaseConnection();
    	    		ActiveSessionConnection activeSessionConn = new ActiveSessionConnection(databaseConn);
    	    		
    	    		Thread dbConn = new Thread(databaseConn);
    	    		Thread activeConn = new Thread(activeSessionConn);
    	    		
    	    		dbConn.start();
    	    		activeConn.start();
                    
//                	if(connectToDB()) {
//                		if (!chckbxStudentRegistration.isSelected()) { 
//	        				textArea.append("\n"+checkMark+"Linking Active Class session...");
//	        				
//	        				JSONObject activeSession = getActiveSession();
//	
//	        				while(activeSession == null) {
//	        					try {
//	        						Thread.sleep(2000);
//	        					} catch (InterruptedException e) {
//	        						// TODO Auto-generated catch block
//	        						e.printStackTrace();
//	        					}
//	        					activeSession = getActiveSession();
//	        				}
//	        				
//	        				textArea.append("\n\n"+checkMark+"Ready to monitor Check-ins for Class: "+activeSession.getString("session")+", started at: "+activeSession.getString("starttime")+"\n\n");
//	        				
//	                		//btnStartSession.setEnabled(true);
//                		}
//	                		
//	                        serialPort = new SerialPort(devicePort); 
//	                        try {
//	                            serialPort.openPort();
//	                            serialPort.setParams(9600, 8, 1, 0);
//	                            int mask = SerialPort.MASK_RXCHAR + SerialPort.MASK_CTS + SerialPort.MASK_DSR;
//	                            serialPort.setEventsMask(mask);
//	                            serialPort.addEventListener(new SerialPortReader());
//	                            
//	                        }
//	                        catch (SerialPortException ex) {
//	                            System.out.println(ex);
//	                        }
//
//                	}
                	
            	} else {
            		textArea.append("No COM* connection found...");
            	}
    		}
    	});
    }
    /*
     * Method: connectToDB
     * Return:boolean
     * Params: none
     * Description: method to connect to database
     */
    public boolean connectToDB() {
    	
    	boolean connected =false;
		try {
            	String userName = "root";
            	String password = "";
            	String url = "jdbc:MySQL://localhost:3306/AttendanceMonitor?autoReconnect=true";        
            	conn = DriverManager.getConnection (url, userName, password);
            	textArea.append(checkMark+"Connection to Database Established..."+"\n");
            	connected = true;
        } catch (Exception ex) {
		       	System.err.println ("Cannot connect to database server");
		       	textArea.append("Cannot connect to database server\n");
			   	ex.printStackTrace();
        } 
    	
		return connected;
    }
    
    public void startSession () throws IOException, FileNotFoundException {
        textArea.append("\n\n######################## Reading IDs #######################\n\n");
        

    }
    
    /*
     * Ignore
     */
    public void addId (String line) {
        textArea.append(line);
    } 
    
    /*
     * Method: startThread
     * Return: void
     * Params: none
     * Description: Method to run background activities: listening and processing data communication from the device, 
     * saving received data to the database, and updating components in the main thread.
     */
     private static void startThread() 
     {
         
         timer.scheduleAtFixedRate(new TimerTask () {
             
             public void run() {
                 runTimer();
             }
             
         }, 1000, 1000);
         
         attendeeCount = 0;
         
         SwingWorker sw = new SwingWorker() {

        	 /*
        	  * (non-Javadoc)
        	  * @see javax.swing.SwingWorker#doInBackground()
        	  */
            @Override
            protected String doInBackground() throws Exception {
                
                //textArea.append("\n\n#############################Reading IDs ################################\n\n");
                
                BufferedReader reader = new BufferedReader(devFile);
                
                String line = "";
                
                while((line = reader.readLine()) != null) {
                    //Thread.sleep(100);
                    System.out.println(" < -- >"+line);
                    publish(line);
                }
                
                return null;
            }
            
            /*
             * (non-Javadoc)
             * @see javax.swing.SwingWorker#process(java.util.List)
             */
            @Override
            protected void process(List chunks) {
                String recentID = (String) chunks.get(chunks.size() - 1);
                
                String parsedID = hexToDec(recentID).toString();
                
                String idToString = parsedID+"";
                
                String completedID = "";
                if(idToString.length() < 10) {
                	completedID = ""+parsedID;
                	for(int i = 0; i < 10 - idToString.length(); i++) {
                		completedID = "0"+completedID;
                	}
                	parsedID = completedID;
                }
                
                txtCurrentId.setText(parsedID+"");
                textArea.append("Read ID: "+parsedID+"\n");
                
				try{
					
					String dateFormat = "yyyy-MM-dd";
				    SimpleDateFormat dateFormatter = new SimpleDateFormat(dateFormat);
				    
		        	Date dToday = new Date();
		        	String session = dateFormatter.format(dToday);
		        	String time = timeFormatter.format(dToday);
					
					stmt = ((Connection) conn).createStatement();
					
					if (chckbxStudentRegistration.isSelected()) {
						
						rs = stmt.executeQuery("SELECT COUNT(*) AS total FROM addAttendee");
						rs.next();
						int count = rs.getInt("total");
						
						if (count > 0) {
							stmt.execute("UPDATE addAttendee SET idNumber='"+parsedID+"',"+"time='"+time+"',date='"+session+"'");
						} else {
							stmt.execute("INSERT INTO addAttendee (idNumber, time, date) values('"+parsedID+"','"+time+"','"+session+"')");
						}
						
					} else {
						if (isSessionActive()) {
							
							rs = stmt.executeQuery("SELECT COUNT(*) AS total FROM students WHERE studid='"+parsedID+"' AND session='"+activeSession+"' AND owner='"+activeOwner+"'");
							rs.next();
							int count = rs.getInt("total");
							
							if (count > 0) {
								stmt.execute("INSERT INTO logs (studid, date, time, session, owner) values('"+parsedID+"','"+session+"','"+time+"','"+activeSession+"','"+activeOwner+"')");
							} else {
								//System.out.println("ID Number "+parsedID+" is not enrolled in class "+activeSession);
								textArea.append("\nID Number "+parsedID+" is not enrolled in class "+activeSession+"\n");
							}
							
						} else {
							if (!chckbxStudentRegistration.isSelected())  {
								textArea.append("\n Ckeckin might have been closed...\n\n Check \"Student Registration\" if registering students\n\n");
							}
	                    }
					}

				}catch(Exception e1){
					System.out.println(e1);
                    e1.printStackTrace();
				}
// =========================== IGNORE == EXPERIMENTAL ================================                
//                JSONObject currentID = new JSONObject();							//
//                Calendar time = Calendar.getInstance();							//	
//                																	//
//                currentID.put("id", parsedID);									//
//                currentID.put("time", timeFormatter.format(time.getTime()));		//
//                																	//
//                readIDs.put(currentID);											//
//                attendeeCount++;													//
//                System.out.println(readIDs.toString());							//
// ================================================================================ // 
                
            }
            
            /*
             * (non-Javadoc)
             * @see javax.swing.SwingWorker#done()
             */
            @Override
            protected void done () {
                try {
                    String status = (String) get();
                    textArea.append("\n"+status+"\ns");
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
         
         };
        
         sw.execute();
     }
     
     /*
      * Method: getActiveSession
      * Return: JSONObject
      * Params: none
      * Description: Method to obtain active session from the web portal 
      */
     public JSONObject getActiveSession() {
    	 
    	 int count1 = 0, count2 = 0;
			
    	 String dateFormat = "yyyy-MM-dd";
		 SimpleDateFormat dateFormatter = new SimpleDateFormat(dateFormat);
		    
     	 Date dToday = new Date();
     	 String session = dateFormatter.format(dToday);
         String time = timeFormatter.format(dToday);
         
			String query = "SELECT * FROM activeSession";
			PreparedStatement pstmt = null;
			ResultSet rs = null;
         
			try{
				
				pstmt = conn.prepareStatement(query);
				rs = pstmt.executeQuery();
				
				while(rs.next()) {
					activeSession = rs.getString(2);
					activeOwner = rs.getString(3);
					activeStartTime = rs.getString(4);
					activeEndTime = rs.getString(5);
					activeDate = rs.getString(6);
					System.out.println(rs.getString(1)+" "+rs.getString(2)+" "+rs.getString(3)+" "+rs.getString(4)+" "+rs.getString(5)+" "+rs.getString(6));
				}
				
			}catch(Exception e1){
				System.out.println(e1);
                e1.printStackTrace();
			} finally {
				try {
					rs.close();
					pstmt.close();
				} catch(SQLException e) {
					e.printStackTrace();
				}
			}
			
			if(activeSession == null || activeDate == null || activeOwner == null || activeStartTime == null || activeEndTime == null || !activeEndTime.contentEquals("00:00:00")) {
				return null;
			}
    	 
			JSONObject activeSessionData = new JSONObject(); 
			activeSessionData.put("session", activeSession);
			activeSessionData.put("owner", activeOwner);
			activeSessionData.put("date", activeDate);
			activeSessionData.put("starttime", activeStartTime);
			activeSessionData.put("endtime", activeStartTime);
			
			return activeSessionData;
    	 
     }
     
     /*
      * Method: isSessionActive
      * Return: Boolean
      * Params: none
      * Description: Method to check whether check-in is active 
      */
     public static boolean isSessionActive() {
    	 
    	 boolean isActive = false;
    	 
			String query = "SELECT * FROM activeSession";
			PreparedStatement pstmt = null;
			ResultSet rs = null;
         
			try{
				
				pstmt = conn.prepareStatement(query);
				rs = pstmt.executeQuery();
				
				while(rs.next()) {
					activeSession = rs.getString(2);
					activeOwner = rs.getString(3);
					activeStartTime = rs.getString(4);
					activeEndTime = rs.getString(5);
					activeDate = rs.getString(6);
					System.out.println(rs.getString(1)+" "+rs.getString(2)+" "+rs.getString(3)+" "+rs.getString(4)+" "+rs.getString(5)+" "+rs.getString(6));
				}
				
			}catch(Exception e1){
				System.out.println(e1);
                e1.printStackTrace();
			} finally {
				try {
					rs.close();
					pstmt.close();
				} catch(SQLException e) {
					e.printStackTrace();
				}
			}
			
			if(activeSession == null || activeDate == null || activeOwner == null || activeStartTime == null || activeEndTime == null) {
				isActive = false;
			} else if (activeEndTime.contentEquals("00:00:00")) {
				isActive = true;
			}
			
			return isActive;
    	 
     }
     
     /*
      * Method: hexToDec
      * Return: BigInteger
      * Params: String
      * Description: method to convert hex number (received from device) to decimal number to be uploaded to web portal
      */
     public static BigInteger hexToDec(String hex) {
    	 return new BigInteger (hex, 16);
     }
     
     // ========  IGNORE ======= I HAD A TIMER FOR THE FIRST ITERATION OF CODE BUT REMOVED IT FROM THE GUI FOR THIS ITERATION ==============
     public static void runTimer () {
         time++;
         updateTimer();
     }
     
     public static String generateTime () {
         
         String currentTime = "";
         
         if(time < 60) {
             
             if (time < 10) {
                 currentTime = "00:00:0"+time;
             } else {
                 currentTime = "00:00:"+time;
             }
             
         } else if (time >= 60 && time < 3600) {
             
             int minutes = time / 60;
             int seconds = (time % 60 );
             String theMinutes = ""+minutes;
             String theSeconds = ""+seconds;
             
             if (minutes < 10) {
                 theMinutes = "0"+minutes;
             }
             
             if (seconds < 10) {
                 theSeconds = "0"+seconds;
             }
             
             currentTime = "00:"+theMinutes+":"+theSeconds;
             
         } else {
             
             int hours = time / 3600;
             int minutes = time % 3600;
             int seconds = time % 216000;
             String theHours = ""+hours;
             String theMinutes = ""+minutes;
             String theSeconds = ""+seconds;

             if (hours < 10) {
                 theHours = "0"+hours;
             }
             
             if (minutes < 10) {
                 theMinutes = "0"+minutes;
             }
             
             if (seconds < 10) {
                 theSeconds = "0"+seconds;
             }
             
             currentTime = theHours+":"+theMinutes+":"+theSeconds;
             
         }
         
         return currentTime;
         
     }
     
     // ======================================================
     
     // =============== IGNORE ===============================
     public static void writeToFile(String location) {
    	 FileOutputStream dataOut = null;
    	 try {
			dataOut = new FileOutputStream(location);
			dataOut.write(allData.toString().getBytes());
		} catch (FileNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
    	 
     }
     // ====================================================
     // =============== IGNORE =============================
     public static void updateTimer () {
         
     }
     // =====================================================
     
     static class SerialPortReader implements SerialPortEventListener {

    	    public void serialEvent(SerialPortEvent event) {
    	    	
    	    	System.out.println("Here");
    	        if(event.isRXCHAR()){
    	                try {
    	                	
    	                	byte[] buffer = serialPort.readBytes(9);
    	                	
    	                	String id  = new String(buffer);
    	                    
    	                    String hexID = id.replace("\n", "").replace("\r", "");
    	                    String parsedID = hexToDec(hexID).toString();
    	                    System.out.println(parsedID);
    	                    

    	                    String idToString = parsedID+"";
    	                    
    	                    String completedID = "";
    	                    if(idToString.length() < 10) {
    	                    	completedID = ""+parsedID;
    	                    	for(int i = 0; i < 10 - idToString.length(); i++) {
    	                    		completedID = "0"+completedID;
    	                    	}
    	                    	parsedID = completedID;
    	                    }
    	                    
    	                    txtCurrentId.setText(parsedID+"");
    	                    textArea.append("Read ID: "+parsedID+"\n");
    	                    
	    	    				try{
	    	    					
	    	    					String dateFormat = "yyyy-MM-dd";
	    	    				    SimpleDateFormat dateFormatter = new SimpleDateFormat(dateFormat);
	    	    				    
	    	    		        	Date dToday = new Date();
	    	    		        	String session = dateFormatter.format(dToday);
	    	    		        	String time = timeFormatter.format(dToday);
	    	    					
	    	    					stmt = ((Connection) conn).createStatement();
	    	    					
	    	    					if (chckbxStudentRegistration.isSelected()) {
	    	    						
	    	    						rs = stmt.executeQuery("SELECT COUNT(*) AS total FROM addAttendee");
	    	    						rs.next();
	    	    						int count = rs.getInt("total");
	    	    						
	    	    						if (count > 0) {
	    	    							stmt.execute("UPDATE addAttendee SET idNumber='"+parsedID+"',"+"time='"+time+"',date='"+session+"'");
	    	    						} else {
	    	    							stmt.execute("INSERT INTO addAttendee (idNumber, time, date) values('"+parsedID+"','"+time+"','"+session+"')");
	    	    						}
	    	    						
	    	    					} else {
	    	    						if (isSessionActive()) {
	    	    							rs = stmt.executeQuery("SELECT COUNT(*) AS total FROM students WHERE studid='"+parsedID+"' AND session='"+activeSession+"' AND owner='"+activeOwner+"'");
	    	    							rs.next();
	    	    							int count = rs.getInt("total");
	    	    							
	    	    							if (count > 0) {
	    	    								stmt.execute("INSERT INTO logs (studid, date, time, session, owner) values('"+parsedID+"','"+session+"','"+time+"','"+activeSession+"','"+activeOwner+"')");
	    	    							} else {
	    	    								//System.out.println("ID Number "+parsedID+" is not enrolled in class "+activeSession);
	    	    								textArea.append("\nID Number "+parsedID+" is not enrolled in class "+activeSession+"\n");
	    	    							}
	    	    							
	    	    						} else {
	    	    							if (!chckbxStudentRegistration.isSelected())  {
	    	    								textArea.append("\n Ckeckin might have been closed...\n\n");
	    	    							}
	    	    	                    }
	    	    					}
	
	    	    				}catch(Exception e1){
	    	    					System.out.println(e1);
	    	                        e1.printStackTrace();
	    	    				}

    	                }
    	                catch (SerialPortException ex) {
    	                    System.out.println(ex);
    	                }
    	        }
    	    }
    	}
     
     public class DeviceConnection implements Runnable {

	   private boolean foundDevice = false;
	   
		@Override
		public void run() {
			// TODO Auto-generated method stub
			try {
				textArea.append("Attempting connection to device...\n");
				getDeviceConnection();
			} catch (IOException | InterruptedException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
    	 
	    /*
	     * Method: getDeviceConnection
	     * Return: boolean
	     * Params: none
	     * Description: method to connect to the USART interface from the device to computer
	     */
	    private void getDeviceConnection () throws IOException, InterruptedException {
	    	
	        foundDevice = false;
	        
	        //textArea.append("Getting things ready...\n\n");
	        String homeDir = System.getProperty("user.home");

	        textArea.append("\n");
	        
	        ProcessBuilder builder = new ProcessBuilder();
	        
	        builder.command("sh", "-c", "ls /dev/cu.*", "/dev/cu.*");
	        builder.directory(new File(System.getProperty("user.home")));
	               
	        Process proc = builder.start();
	        
	        reader =  new BufferedReader(new InputStreamReader(proc.getInputStream()));

	        String line = "";
	        
	        while((line = reader.readLine()) != null) {
	           System.out.println(line);
	           if (line.contains("cu.usbserial")) {
	               devicePort = line;
	               foundDevice = true;
	               textArea.append("\n"+checkMark+"Found Device at "+line+"\n\n");
	               
		            devFile = new FileReader(devicePort);
		            
		            startThread();
	           }
	        }
	        int exitCode = proc.waitFor();
	        
	        if (!foundDevice) {
	            textArea.append("\nNo Device Found. Please make sure device is connected.\n\n");
	        } 
	        
	    }
	    
	    public boolean connectToDevice () {
	    	return foundDevice;
	    }
	    
     }
     
     public class DatabaseConnection implements Runnable {

	    private boolean connected =false;
	    	
		@Override
		public void run() {
			// TODO Auto-generated method stub
			textArea.append("Attempting connection to database\n");
			getConnectionToDB();
		}
		
	    /*
	     * Method: getConnectionToDB
	     * Return:void
	     * Params: none
	     * Description: method to connect to database
	     */
	    private void getConnectionToDB() {
	    	
	    	connected =false;
			try {
	            	String userName = "root";
	            	String password = "";
	            	String url = "jdbc:MySQL://localhost:3306/AttendanceMonitor?autoReconnect=true";        
	            	conn = DriverManager.getConnection (url, userName, password);
	            	textArea.append(checkMark+"Connection to Database Established..."+"\n");
	            	connected = true;
	        } catch (Exception ex) {
			       	System.err.println ("Cannot connect to database server");
			       	textArea.append("Cannot connect to database server\n");
				   	ex.printStackTrace();
	        } 
	    	
	    }
	    
	    public boolean connectToDB() {
	    	return connected;
	    }
    	 
     }
     
     public class ActiveSessionConnection implements Runnable {

    	 private JSONObject activeSessionData = new JSONObject(); 
    	 private DeviceConnection deviceConn = null;
    	 private DatabaseConnection databaseConn = null;
    	 
    	 public ActiveSessionConnection(DeviceConnection deviceConn, DatabaseConnection databaseConn) {
    		 this.deviceConn = deviceConn;
    		 this.databaseConn = databaseConn;
		}
    	 
    	 public ActiveSessionConnection(DatabaseConnection databaseConn) {
    		 this.databaseConn = databaseConn;
		}
    	 
		@Override
		public void run() {
			// TODO Auto-generated method stub
			linkActiveSession();
		}
		
		   /*
	      * Method: linkActiveSession
	      * Return: void
	      * Params: none
	      * Description: Method to obtain active session from the web portal 
	      */
	     public void linkActiveSession() {
	    	 
	    	 String osType = System.getProperty("os.name");

	         if (osType.contains("Mac")) {
	     		while(!deviceConn.connectToDevice() || !databaseConn.connectToDB()) {
					try {
						Thread.sleep(2000);
					} catch (InterruptedException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
					
					if(!deviceConn.connectToDevice()) {
			    		textArea.append("Waiting for device connection...\n");
			    		try {
							deviceConn.getDeviceConnection();
						} catch (IOException | InterruptedException e) {
							// TODO Auto-generated catch block
							e.printStackTrace();
						}
					}
					
					if(!databaseConn.connectToDB()) {
			    		textArea.append("Waiting for databse connection...\n");
			    		databaseConn.getConnectionToDB();
					}
	    		} 
	         } else if(osType.contains("Windows")) {
		     		while(!databaseConn.connectToDB()) {
						try {
							Thread.sleep(2000);
						} catch (InterruptedException e) {
							// TODO Auto-generated catch block
							e.printStackTrace();
						}
						
						if(!databaseConn.connectToDB()) {
				    		textArea.append("Waiting for databse connection...\n");
				    		databaseConn.getConnectionToDB();
						}
		    		}
	         }
	         
	         if (osType.contains("Windows")) {
                 serialPort = new SerialPort(devicePort); 
                 try {
                     serialPort.openPort();
                     serialPort.setParams(9600, 8, 1, 0);
                     int mask = SerialPort.MASK_RXCHAR + SerialPort.MASK_CTS + SerialPort.MASK_DSR;
                     serialPort.setEventsMask(mask);
                     serialPort.addEventListener(new SerialPortReader());
                     
                 }
                 catch (SerialPortException ex) {
                     System.out.println(ex);
                 }
	         }
    		
    		textArea.append("\nWaiting for start of session or student registration\n");
	    	 
	    	 int count1 = 0, count2 = 0;
				
	    	 String dateFormat = "yyyy-MM-dd";
			 SimpleDateFormat dateFormatter = new SimpleDateFormat(dateFormat);
			    
	     	 Date dToday = new Date();
	     	 String session = dateFormatter.format(dToday);
	         String time = timeFormatter.format(dToday);
	         
				String query = "SELECT * FROM activeSession";
				PreparedStatement pstmt = null;
				ResultSet rs = null;
	         
				try{
					
					pstmt = conn.prepareStatement(query);
					rs = pstmt.executeQuery();
					
					while(rs.next()) {
						activeSession = rs.getString(2);
						activeOwner = rs.getString(3);
						activeStartTime = rs.getString(4);
						activeEndTime = rs.getString(5);
						activeDate = rs.getString(6);
						System.out.println(rs.getString(1)+" "+rs.getString(2)+" "+rs.getString(3)+" "+rs.getString(4)+" "+rs.getString(5)+" "+rs.getString(6));
					}
					
				}catch(Exception e1){
					System.out.println(e1);
	                e1.printStackTrace();
				} finally {
					try {
						rs.close();
						pstmt.close();
					} catch(SQLException e) {
						e.printStackTrace();
					}
				}
	    	 
				activeSessionData = new JSONObject(); 
				activeSessionData.put("session", activeSession);
				activeSessionData.put("owner", activeOwner);
				activeSessionData.put("date", activeDate);
				activeSessionData.put("starttime", activeStartTime);
				activeSessionData.put("endtime", activeStartTime);
	    	 
	     }
	     
	     public JSONObject getActiveSession() {
	    	 
				if(activeSession == null || activeDate == null || activeOwner == null || activeStartTime == null || activeEndTime == null || !activeEndTime.contentEquals("00:00:00")) {
					return null;
				}
				
				return activeSessionData;
	     }
    	 
     }
}
