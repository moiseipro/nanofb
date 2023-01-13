from nf_presentation import assets

f=assets.get_rfs_logo()
data=f.read()

with open('logo.png','wb') as w:
    w.write(data)

f.close()

