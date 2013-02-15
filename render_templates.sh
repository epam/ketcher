for i in icons/mol/template*.mol; do
./depict $i icons/png/template/`basename $i | sed 's/.mol/.png/g'` -w 32 -h 32 -margins 0 0 -thickness 1.5
./depict $i icons/png/template/`basename $i | sed 's/.mol/.24.png/g'` -w 32 -h 32 -margins 0 0 -thickness 1.5
done
