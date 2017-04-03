int num = 20;
float step, sz, offSet, theta, angle;

void setup() {
  size(600, 400);
  strokeWeight(5);
  step = 22;
}

void draw() {
  if(mousePressed){
    background(255, 255, 255);
  } else {
    background(0, 0, 0);
  }
  translate(width/2, height*.75);
  angle=0;
  for (int i=0; i<num; i++) {
    
    if(mousePressed){
      stroke(255, 0, 0);
    } else {
      stroke(255, 255, 255);
    }
    
    noFill();
    sz = i*step;
    float offSet = TWO_PI/num*i;
    float arcEnd = map(sin(theta+offSet), -1, 1, PI, TWO_PI);
    arc(0, 0, sz, sz, PI, arcEnd);
  }
  colorMode(RGB);
  resetMatrix();
  theta += map(mouseX, 0, width, 0.001, 0.1);
  
}

